/** File rules for config/images/, shared by the Vite plugin (Node) and the loader (browser). */

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

/** Gallery photos live in config/images/gallery/; keys in the image map are relative to config/images/. */
export const GALLERY_PREFIX = 'gallery/'

export function isImageFile(name: string): boolean {
  const lower = name.toLowerCase()
  return !lower.startsWith('.') && IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/** Natural order, so "2.jpg" sorts before "10.jpg". */
export function compareFileNames(a: string, b: string): number {
  return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' })
}
