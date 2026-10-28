import { describe, expect, it } from 'vitest'
import { images } from 'virtual:content-images'
import raw from '../../config/wedding.json'
import { dateLineOf, galleryFiles, resolveWedding, shareDescriptionOf } from './resolve'
import { ContentError, validateWedding } from './validate'
import { wedding } from './wedding'

const clone = () => structuredClone(raw) as Record<string, Record<string, unknown>>

function expectError(mutate: (cfg: Record<string, Record<string, unknown>>) => void, path: string) {
  const cfg = clone()
  mutate(cfg)
  expect(() => validateWedding(cfg)).toThrow(ContentError)
  expect(() => validateWedding(cfg)).toThrow(`"${path}"`)
}

describe('config/wedding.json', () => {
  it('passes validation', () => {
    expect(() => validateWedding(raw)).not.toThrow()
  })

  // The plugin builds `images` by reading config/images/ and each file's header, so a key here is a file on disk.
  it('names images that exist on disk with a readable size', () => {
    const content = validateWedding(raw)
    expect(images[content.cover.image]).toBeDefined()
    for (const photo of content.location.images ?? []) expect(images[photo.image]).toBeDefined()
    for (const name of Object.keys(content.gallery.captions ?? {})) expect(images[`gallery/${name}`]).toBeDefined()
    expect(galleryFiles(images).length).toBeGreaterThan(0)
    for (const [key, { width, height }] of Object.entries(images)) {
      expect(width, key).toBeGreaterThan(0)
      expect(height, key).toBeGreaterThan(0)
    }
  })

  // Derived from the owner's files, not fixed values, so replacing photos or copy keeps `npm test` (and the deploy) green.
  it('loads through the plugin into sized gallery images in file-name order', () => {
    const content = validateWedding(raw)
    const cover = images[content.cover.image]
    expect(wedding.cover.image).toEqual({ src: cover.url, width: cover.width, height: cover.height, alt: content.cover.alt })
    const expected = galleryFiles(images).map((name, i) => {
      const { url, width, height } = images[`gallery/${name}`]
      return { src: url, width, height, alt: content.gallery.captions?.[name] ?? `${content.gallery.alt} ${i + 1}` }
    })
    expect(wedding.gallery.images).toEqual(expected)
    expect(wedding.location.images).toEqual((content.location.images ?? []).map(({ image, alt }) => {
      const { url, width, height } = images[image]
      return { src: url, width, height, alt }
    }))
    expect(wedding.share.kakaoDescription).toBe(content.share.kakaoDescription ?? `${dateLineOf(wedding.event)} · ${wedding.event.venueName}`)
  })
})

describe('validateWedding', () => {
  it('names a missing field', () => {
    expectError((c) => delete c.couple.groom, 'couple.groom')
    expectError((c) => delete (c.event as Record<string, unknown>).startsAt, 'event.startsAt')
  })

  it('names a wrong type', () => {
    expectError((c) => (c.greeting.enabled = 'true'), 'greeting.enabled')
    expectError((c) => (c.rsvp.intro = '한 줄'), 'rsvp.intro')
    expectError((c) => ((c.event.coords as Record<string, unknown>).lat = '37.5'), 'event.coords.lat')
  })

  it('rejects an empty name, a bad date and a non-image cover', () => {
    expectError((c) => ((c.couple.bride as Record<string, unknown>).name = ' '), 'couple.bride.name')
    expectError((c) => (c.event.startsAt = '2027-05-15 12:00'), 'event.startsAt')
    expectError((c) => (c.event.startsAt = '2027-02-31T12:00:00+09:00'), 'event.startsAt')
    expectError((c) => (c.event.startsAt = '2027-05-15T24:00+09:00'), 'event.startsAt')
    expectError((c) => (c.cover.image = 'cover.gif'), 'cover.image')
  })

  it('rejects unknown keys (typos) but allows "_" notes', () => {
    expectError((c) => (c.footer.enabeld = true), 'footer.enabeld')
    const cfg = clone()
    cfg.footer._memo = '메모'
    expect(() => validateWedding(cfg)).not.toThrow()
  })

  it('accepts optional HTTPS transport links', () => {
    const cfg = clone()
    delete cfg.location.transportLinks
    expect(validateWedding(cfg).location.transportLinks).toEqual({})
    cfg.location.transportLinks = { subway: 'https://map.naver.com/' }
    expect(validateWedding(cfg).location.transportLinks).toEqual({ subway: 'https://map.naver.com/' })
  })

  it('accepts omitted or empty venue photos', () => {
    const cfg = clone()
    delete cfg.location.images
    expect(validateWedding(cfg).location.images).toEqual([])
    cfg.location.images = []
    expect(validateWedding(cfg).location.images).toEqual([])
  })

  it('rejects malformed venue photos, unsafe paths and blank descriptions', () => {
    expectError((c) => (c.location.images = 'venue.jpg'), 'location.images')
    expectError((c) => (c.location.images = [{ image: '../venue.jpg', alt: '입구' }]), 'location.images[0].image')
    expectError((c) => (c.location.images = [{ image: 'venue.jpg', alt: ' ' }]), 'location.images[0].alt')
  })

  it('rejects unsafe transport links and unknown transport keys', () => {
    expectError((c) => (c.location.transportLinks = { bus: 'javascript:alert(1)' }), 'location.transportLinks.bus')
    expectError((c) => (c.location.transportLinks = { buses: 'https://map.naver.com/' }), 'location.transportLinks.buses')
  })
})

describe('resolveWedding', () => {
  const images = {
    'cover.jpg': { url: '/a/cover.jpg', width: 3, height: 4 },
    'gallery/10.jpg': { url: '/a/10.jpg', width: 1, height: 1 },
    'gallery/2.png': { url: '/a/2.png', width: 2, height: 1 },
    'gallery/sub/x.jpg': { url: '/a/x.jpg', width: 1, height: 1 },
    'venue/exterior.webp': { url: '/a/exterior.webp', width: 3, height: 2 },
    'venue/entrance.webp': { url: '/a/entrance.webp', width: 8, height: 5 },
  }
  /** The committed JSON pinned to these fake images, so the owner's own file names and alt text do not matter here. */
  const fixture = () => {
    const cfg = clone()
    return validateWedding({ ...cfg, cover: { ...cfg.cover, image: 'cover.jpg' }, gallery: { ...cfg.gallery, alt: '사진', captions: {} }, location: { ...cfg.location, images: [] } })
  }

  it('orders gallery files naturally and ignores sub-folders', () => {
    expect(galleryFiles(images)).toEqual(['2.png', '10.jpg'])
  })

  it('applies captions and numbers the rest', () => {
    const base = fixture()
    const content = { ...base, gallery: { ...base.gallery, captions: { '10.jpg': '바닷가에서' } } }
    const resolved = resolveWedding(content, images)
    expect(resolved.gallery.images.map((i) => i.alt)).toEqual(['사진 1', '바닷가에서'])
  })

  it('throws when the cover or a caption names a missing file', () => {
    const content = fixture()
    expect(() => resolveWedding(content, images)).not.toThrow()
    expect(() => resolveWedding({ ...content, cover: { ...content.cover, image: 'none.jpg' } }, images)).toThrow('cover.image')
    const withCaption = { ...content, gallery: { ...content.gallery, captions: { '99.jpg': 'x' } } }
    expect(() => resolveWedding(withCaption, images)).toThrow('gallery.captions.99.jpg')
  })

  it('resolves venue photos in configured order and names a missing photo', () => {
    const content = fixture()
    expect(resolveWedding(content, images).location.images).toEqual([])
    content.location.images = [
      { image: 'venue/entrance.webp', alt: '정면 입구' },
      { image: 'venue/exterior.webp', alt: '건물 전경' },
    ]
    expect(resolveWedding(content, images).location.images).toEqual([
      { src: '/a/entrance.webp', width: 8, height: 5, alt: '정면 입구' },
      { src: '/a/exterior.webp', width: 3, height: 2, alt: '건물 전경' },
    ])
    content.location.images[1].image = 'venue/missing.webp'
    expect(() => resolveWedding(content, images)).toThrow('location.images[1].image')
  })

  it('keeps an explicit share description', () => {
    const content = validateWedding(raw)
    expect(shareDescriptionOf({ ...content, share: { ...content.share, kakaoDescription: '직접 쓴 문구' } })).toBe('직접 쓴 문구')
  })
})
