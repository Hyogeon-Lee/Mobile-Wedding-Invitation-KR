/**
 * Intrinsic size of a PNG, JPEG or WebP from its header bytes, as the browser will display it.
 * JPEGs with an EXIF orientation of 5-8 (phone photos taken in portrait) are rotated 90 degrees on
 * screen, so their width and height are swapped.
 */
export interface ImageSize {
  width: number
  height: number
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

export function readImageSize(buf: Buffer): ImageSize | null {
  if (PNG_SIGNATURE.every((b, i) => buf[i] === b)) return readPng(buf)
  if (buf[0] === 0xff && buf[1] === 0xd8) return readJpeg(buf)
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return readWebp(buf)
  return null
}

// Width and height are the first two fields of the IHDR chunk, which always follows the signature.
function readPng(buf: Buffer): ImageSize | null {
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

// Start-of-frame markers (baseline, extended, progressive, lossless, arithmetic). C4, C8 and CC are not frames.
const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])

function readJpeg(buf: Buffer): ImageSize | null {
  let orientation = 1
  let i = 2
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]
    if (marker === 0xff) {
      i += 1
      continue
    }
    // Standalone markers carry no length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      i += 2
      continue
    }
    if (marker === 0xd9 || marker === 0xda) return null
    const length = buf.readUInt16BE(i + 2)
    if (marker === 0xe1) orientation = exifOrientation(buf, i + 4, length - 2) ?? orientation
    if (SOF_MARKERS.has(marker)) {
      if (i + 9 > buf.length) return null
      const height = buf.readUInt16BE(i + 5)
      const width = buf.readUInt16BE(i + 7)
      return orientation >= 5 && orientation <= 8 ? { width: height, height: width } : { width, height }
    }
    i += 2 + length
  }
  return null
}

/** Orientation tag (0x0112) from IFD0 of an APP1 "Exif" segment, or null. */
function exifOrientation(buf: Buffer, start: number, length: number): number | null {
  const end = Math.min(start + length, buf.length)
  if (end - start < 14 || buf.toString('ascii', start, start + 6) !== 'Exif\0\0') return null
  const tiff = start + 6
  const order = buf.toString('ascii', tiff, tiff + 2)
  if (order !== 'II' && order !== 'MM') return null
  const le = order === 'II'
  const u16 = (at: number) => (le ? buf.readUInt16LE(at) : buf.readUInt16BE(at))
  const u32 = (at: number) => (le ? buf.readUInt32LE(at) : buf.readUInt32BE(at))
  const ifd = tiff + u32(tiff + 4)
  if (ifd + 2 > end) return null
  const count = u16(ifd)
  for (let n = 0; n < count; n++) {
    const entry = ifd + 2 + n * 12
    if (entry + 12 > end) return null
    if (u16(entry) === 0x0112) return u16(entry + 8)
  }
  return null
}

function readWebp(buf: Buffer): ImageSize | null {
  if (buf.length < 30) return null
  const chunk = buf.toString('ascii', 12, 16)
  // Lossy: 14-bit sizes after the 3-byte frame tag and 3-byte start code.
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  // Lossless: after the 0x2f signature, 14 bits of (width - 1) then 14 bits of (height - 1), little-endian.
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  // Extended: 24-bit (canvas width - 1) and (canvas height - 1).
  if (chunk === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 }
  return null
}
