// Generates placeholder photos as JPEG into config/images/ (cover.jpg, gallery/01.jpg … 12.jpg) and the map
// fallback SVG into public/images/. Renders each SVG with Playwright (not a dependency of this project).
// Run: npm run placeholders. Overwrites those JPEGs, so do not run it once real photos are in place.
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const { chromium } = createRequire(import.meta.url)('playwright')

const imagesDir = join(process.cwd(), 'config', 'images')
const galleryDir = join(imagesDir, 'gallery')
const publicDir = join(process.cwd(), 'public', 'images')
for (const dir of [galleryDir, publicDir]) mkdirSync(dir, { recursive: true })

const palettes = [
  ['#eef3ea', '#cfdccb'],
  ['#e3f0e1', '#b9d8bd'],
  ['#f1f5ef', '#d6e3d4'],
  ['#e9f2f3', '#cfdfe1'],
  ['#e6f1e4', '#a9d4b4'],
  ['#edf4e6', '#c8dcb6'],
]

function svg(w, h, label, [c1, c2]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${Math.min(w, h) * 0.16}" fill="rgba(255,255,255,0.35)"/>
  <text x="50%" y="${h * 0.78}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(w * 0.05)}" fill="rgba(40,72,56,0.55)" letter-spacing="4">${label}</text>
</svg>
`
}

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })

async function writeJpeg(file, w, h, label, palette) {
  await page.setViewportSize({ width: w, height: h })
  await page.setContent(`<!doctype html><html><body style="margin:0">${svg(w, h, label, palette)}</body></html>`)
  const jpeg = await page.screenshot({ type: 'jpeg', quality: 75, clip: { x: 0, y: 0, width: w, height: h } })
  writeFileSync(file, jpeg)
  console.log(`${relative(process.cwd(), file)} ${w}x${h} ${(jpeg.length / 1024).toFixed(1)} KB`)
}

await writeJpeg(join(imagesDir, 'cover.jpg'), 1200, 1600, 'MAIN PHOTO', palettes[0])
// Every third photo is landscape: the gallery grid spans those tiles across both columns.
for (let i = 1; i <= 12; i++) {
  const [w, h] = i % 3 === 0 ? [1200, 900] : [1200, 1500]
  await writeJpeg(join(galleryDir, `${String(i).padStart(2, '0')}.jpg`), w, h, `PHOTO ${i}`, palettes[(i - 1) % palettes.length])
}
await browser.close()

writeFileSync(join(publicDir, 'map-fallback.svg'), svg(1200, 800, 'MAP (fallback)', palettes[3]))
console.log('public/images/map-fallback.svg')
