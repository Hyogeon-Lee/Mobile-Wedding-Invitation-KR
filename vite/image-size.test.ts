import { describe, expect, it } from 'vitest'
import { readImageSize } from './image-size.ts'

const bytes = (...parts: (number[] | string | Buffer)[]) =>
  Buffer.concat(parts.map((p) => (typeof p === 'string' ? Buffer.from(p, 'ascii') : Buffer.from(p))))
const u32be = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
const u32le = (n: number) => u32be(n).reverse()
const u24le = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255]

describe('readImageSize', () => {
  it('reads PNG IHDR', () => {
    const png = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], u32be(13), 'IHDR', u32be(300), u32be(200), [8, 6, 0, 0, 0])
    expect(readImageSize(png)).toEqual({ width: 300, height: 200 })
  })

  it('reads a JPEG frame header and swaps sides for EXIF orientation 6', () => {
    const exif = bytes('Exif\0\0', 'MM', [0, 0x2a], u32be(8), [0, 1], [0x01, 0x12, 0, 3], u32be(1), [0, 6, 0, 0], u32be(0))
    const app1 = bytes([0xff, 0xe1], [0, exif.length + 2], exif)
    const sof = bytes([0xff, 0xc2, 0, 17, 8, 0, 100, 0, 200, 3], new Array(9).fill(0))
    expect(readImageSize(bytes([0xff, 0xd8], sof))).toEqual({ width: 200, height: 100 })
    expect(readImageSize(bytes([0xff, 0xd8], app1, sof))).toEqual({ width: 100, height: 200 })
  })

  it('reads WebP VP8X and VP8L', () => {
    const vp8x = bytes('RIFF', u32le(30), 'WEBP', 'VP8X', u32le(10), [0, 0, 0, 0], u24le(1199), u24le(899))
    expect(readImageSize(vp8x)).toEqual({ width: 1200, height: 900 })
    const vp8l = bytes('RIFF', u32le(30), 'WEBP', 'VP8L', u32le(10), [0x2f], u32le(399 | (299 << 14)), [0, 0, 0, 0, 0])
    expect(readImageSize(vp8l)).toEqual({ width: 400, height: 300 })
  })

  it('returns null for other formats', () => {
    expect(readImageSize(Buffer.from('GIF89a\0\0\0\0'))).toBeNull()
  })
})
