import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import { compareFileNames, isImageFile } from '../src/config/content-files.ts'
import { resolveWedding, shareDescriptionOf, type ContentImages } from '../src/config/resolve.ts'
import { validateWedding } from '../src/config/validate.ts'
import type { WeddingContent } from '../src/config/types.ts'
import { readImageSize } from './image-size.ts'

const VIRTUAL_ID = 'virtual:content-images'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

interface ScannedImage {
  /** Path relative to config/images/, with forward slashes */
  key: string
  file: string
  width: number
  height: number
}

function scanImages(dir: string): ScannedImage[] {
  let entries: string[]
  try {
    entries = readdirSync(dir, { recursive: true, encoding: 'utf8' })
  } catch {
    return []
  }
  return entries
    .map((rel) => rel.split(path.sep).join('/'))
    .filter((rel) => rel.split('/').every((part) => !part.startsWith('.')) && isImageFile(path.posix.basename(rel)))
    .sort(compareFileNames)
    .map((key) => {
      const file = path.join(dir, key)
      const size = readImageSize(readFileSync(file))
      if (!size || size.width === 0 || size.height === 0) {
        throw new Error(`config/images/${key}: 이미지 크기를 읽을 수 없습니다. 손상되었거나 지원하지 않는 형식입니다.`)
      }
      return { key, file, ...size }
    })
}

function readContent(jsonPath: string): WeddingContent {
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(jsonPath, 'utf8'))
  } catch (error) {
    throw new Error(`config/wedding.json을 읽을 수 없습니다(JSON 문법 오류): ${(error as Error).message}`, { cause: error })
  }
  return validateWedding(parsed)
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/**
 * Serves config/images/ as `virtual:content-images` (URL + intrinsic size per file, through Vite's asset
 * pipeline so hashing and the base path apply), validates config/wedding.json at startup, and fills the
 * {{title}} / {{description}} tokens in index.html from it.
 */
export default function contentImages(): Plugin {
  let configDir = path.resolve('config')
  let imagesDir = path.join(configDir, 'images')
  let jsonPath = path.join(configDir, 'wedding.json')

  const imageMap = (): ContentImages =>
    Object.fromEntries(scanImages(imagesDir).map(({ key, width, height }) => [key, { url: key, width, height }]))

  return {
    name: 'content-images',

    configResolved(config) {
      configDir = path.join(config.root, 'config')
      imagesDir = path.join(configDir, 'images')
      jsonPath = path.join(configDir, 'wedding.json')
    },

    // Fail the build (and dev start) with the Korean field message instead of shipping a blank page.
    buildStart() {
      resolveWedding(readContent(jsonPath), imageMap())
      this.addWatchFile(jsonPath)
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },

    load(id) {
      if (id !== RESOLVED_ID) return undefined
      const images = scanImages(imagesDir)
      const imports: string[] = []
      const entries: string[] = []
      images.forEach(({ key, file, width, height }, i) => {
        this.addWatchFile(file)
        imports.push(`import u${i} from ${JSON.stringify(`/config/images/${key}`)}`)
        entries.push(`  ${JSON.stringify(key)}: { url: u${i}, width: ${width}, height: ${height} },`)
      })
      return `${imports.join('\n')}\nexport const images = {\n${entries.join('\n')}\n}\n`
    },

    configureServer(server: ViteDevServer) {
      server.watcher.add(configDir)
      const onFsEvent = (file: string) => {
        const inImages = file.startsWith(imagesDir + path.sep)
        if (!inImages && file !== jsonPath) return
        if (inImages) {
          for (const env of Object.values(server.environments)) {
            const mod = env.moduleGraph.getModuleById(RESOLVED_ID)
            if (mod) env.moduleGraph.invalidateModule(mod)
          }
        }
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', onFsEvent)
      server.watcher.on('unlink', onFsEvent)
      server.watcher.on('change', onFsEvent)
    },

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const content = readContent(jsonPath)
        // Also check file references here: in dev this runs on every page load, so a missing photo shows the error overlay.
        resolveWedding(content, imageMap())
        const values: Record<string, string> = {
          title: content.share.kakaoTitle,
          description: shareDescriptionOf(content),
        }
        return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (token, key: string) => {
          if (!(key in values)) throw new Error(`index.html: 알 수 없는 토큰 ${token}`)
          return escapeHtml(values[key])
        })
      },
    },
  }
}
