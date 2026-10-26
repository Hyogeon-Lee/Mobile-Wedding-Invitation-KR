import type { Parent, Person, TransportInfo, WeddingContent } from './types.ts'
import { IMAGE_EXTENSIONS, isImageFile } from './content-files.ts'

/**
 * Hand-written runtime check for config/wedding.json. Each failure names the field path,
 * e.g. `config/wedding.json 오류 — "couple.groom.name": 값이 비어 있습니다.`
 * Keys starting with "_" or "$" are ignored so the owner can leave notes such as "_memo".
 */
export class ContentError extends Error {
  readonly path: string
  constructor(path: string, message: string) {
    super(`config/wedding.json 오류 — "${path}": ${message}`)
    this.name = 'ContentError'
    this.path = path
  }
}

type Obj = Record<string, unknown>

const at = (path: string, key: string) => (path ? `${path}.${key}` : key)

function fail(path: string, message: string): never {
  throw new ContentError(path, message)
}

function object(value: unknown, path: string, allowed: readonly string[]): Obj {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(path || '(전체)', '{ } 형태의 객체여야 합니다.')
  for (const key of Object.keys(value)) {
    if (key.startsWith('_') || key.startsWith('$') || allowed.includes(key)) continue
    fail(at(path, key), `알 수 없는 항목입니다. 쓸 수 있는 항목: ${allowed.join(', ')}`)
  }
  return value as Obj
}

function present(o: Obj, key: string, path: string): unknown {
  if (!(key in o) || o[key] === undefined || o[key] === null) fail(at(path, key), '항목이 없습니다.')
  return o[key]
}

function string(o: Obj, key: string, path: string, { nonEmpty = false } = {}): string {
  const v = present(o, key, path)
  if (typeof v !== 'string') fail(at(path, key), '값은 "글자"처럼 큰따옴표로 감싼 문자열이어야 합니다.')
  if (nonEmpty && v.trim() === '') fail(at(path, key), '값이 비어 있습니다.')
  return v
}

function optionalString(o: Obj, key: string, path: string): string | undefined {
  return o[key] === undefined ? undefined : string(o, key, path)
}

function boolean(o: Obj, key: string, path: string): boolean {
  const v = present(o, key, path)
  if (typeof v !== 'boolean') fail(at(path, key), '값은 true 또는 false여야 합니다(따옴표 없이).')
  return v
}

function number(o: Obj, key: string, path: string, min: number, max: number): number {
  const v = present(o, key, path)
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(at(path, key), '값은 숫자여야 합니다(따옴표 없이).')
  if (v < min || v > max) fail(at(path, key), `값은 ${min}부터 ${max} 사이여야 합니다.`)
  return v
}

function lines(o: Obj, key: string, path: string): string[] {
  const v = present(o, key, path)
  if (!Array.isArray(v)) fail(at(path, key), '값은 ["첫 줄", "둘째 줄"]처럼 문자열 배열이어야 합니다.')
  v.forEach((line, i) => {
    if (typeof line !== 'string') fail(`${at(path, key)}[${i}]`, '값은 문자열이어야 합니다.')
  })
  return v as string[]
}

function optionalLines(o: Obj, key: string, path: string): string[] | undefined {
  return o[key] === undefined ? undefined : lines(o, key, path)
}

function imageName(o: Obj, key: string, path: string): string {
  const v = string(o, key, path, { nonEmpty: true })
  if (!isImageFile(v) || v.includes('\\') || v.split('/').includes('..')) {
    fail(at(path, key), `config/images/ 안의 파일 이름이어야 합니다(${IMAGE_EXTENSIONS.join(', ')}).`)
  }
  return v
}

// KST ISO 8601 such as "2027-05-15T12:00:00+09:00", seconds optional
const KST_ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?\+09:00$/

/** Date parsing rolls "02-31" over to March, so reject any field that does not survive a round trip */
function isRealDateTime(v: string): boolean {
  const m = KST_ISO.exec(v)
  if (!m) return false
  const [y, mo, d, h, mi, s = 0] = m.slice(1).map((part) => (part === undefined ? 0 : Number(part)))
  const t = new Date(Date.UTC(y, mo - 1, d, h, mi, s))
  return (
    t.getUTCFullYear() === y &&
    t.getUTCMonth() === mo - 1 &&
    t.getUTCDate() === d &&
    t.getUTCHours() === h &&
    t.getUTCMinutes() === mi &&
    t.getUTCSeconds() === s
  )
}

function startsAt(o: Obj, path: string): string {
  const v = string(o, 'startsAt', path, { nonEmpty: true })
  if (!isRealDateTime(v)) {
    fail(at(path, 'startsAt'), '값은 "2027-05-15T12:00:00+09:00" 형식(한국 시간)이어야 합니다.')
  }
  return v
}

function parent(value: unknown, path: string): Parent {
  const o = object(value, path, ['name', 'deceased'])
  const result: Parent = { name: string(o, 'name', path, { nonEmpty: true }) }
  if (o.deceased !== undefined) result.deceased = boolean(o, 'deceased', path)
  return result
}

function person(value: unknown, path: string): Person {
  const o = object(value, path, ['name', 'relation', 'father', 'mother'])
  const result: Person = {
    name: string(o, 'name', path, { nonEmpty: true }),
    relation: string(o, 'relation', path),
  }
  if (o.father !== undefined) result.father = parent(o.father, at(path, 'father'))
  if (o.mother !== undefined) result.mother = parent(o.mother, at(path, 'mother'))
  return result
}

const TRANSPORT_KEYS = ['subway', 'bus', 'car', 'parking', 'shuttle'] as const

function transport(value: unknown, path: string): TransportInfo {
  const o = object(value, path, TRANSPORT_KEYS)
  const result: TransportInfo = {}
  for (const key of TRANSPORT_KEYS) {
    const v = optionalLines(o, key, path)
    if (v) result[key] = v
  }
  return result
}

function heading(o: Obj, path: string) {
  return { enabled: boolean(o, 'enabled', path), eyebrow: string(o, 'eyebrow', path), title: string(o, 'title', path) }
}

const SECTION_KEYS = [
  'couple',
  'event',
  'cover',
  'greeting',
  'family',
  'calendar',
  'gallery',
  'location',
  'account',
  'rsvp',
  'guestbook',
  'share',
  'footer',
] as const

/** Validate parsed config/wedding.json and return it typed; throws ContentError naming the first bad field. */
export function validateWedding(input: unknown): WeddingContent {
  const root = object(input, '', SECTION_KEYS)
  for (const key of SECTION_KEYS) present(root, key, '')

  const couple = object(root.couple, 'couple', ['groom', 'bride'])
  present(couple, 'groom', 'couple')
  present(couple, 'bride', 'couple')

  const e = object(root.event, 'event', [
    'startsAt',
    'datePlaceholder',
    'venueName',
    'hall',
    'address',
    'addressJibun',
    'naverMapUrl',
    'coords',
    'venuePhone',
  ])
  const c = object(present(e, 'coords', 'event'), 'event.coords', ['lat', 'lng', 'placeholder'])
  const coords: WeddingContent['event']['coords'] = {
    lat: number(c, 'lat', 'event.coords', -90, 90),
    lng: number(c, 'lng', 'event.coords', -180, 180),
  }
  if (c.placeholder !== undefined) coords.placeholder = boolean(c, 'placeholder', 'event.coords')

  const cover = object(root.cover, 'cover', ['enabled', 'eyebrow', 'image', 'alt'])
  const greeting = object(root.greeting, 'greeting', ['enabled', 'eyebrow', 'title', 'body', 'quote'])
  const family = object(root.family, 'family', ['enabled', 'eyebrow', 'title'])
  const calendar = object(root.calendar, 'calendar', ['enabled', 'eyebrow'])
  const gallery = object(root.gallery, 'gallery', ['enabled', 'eyebrow', 'title', 'alt', 'captions'])
  const location = object(root.location, 'location', ['enabled', 'eyebrow', 'title', 'transport', 'transportLinks'])
  const account = object(root.account, 'account', ['enabled', 'eyebrow', 'title', 'intro'])
  const rsvp = object(root.rsvp, 'rsvp', ['enabled', 'eyebrow', 'title', 'intro'])
  const guestbook = object(root.guestbook, 'guestbook', ['enabled', 'eyebrow', 'title'])
  const share = object(root.share, 'share', [
    'enabled',
    'eyebrow',
    'title',
    'intro',
    'kakaoTitle',
    'kakaoDescription',
    'buttonLabel',
  ])
  const footer = object(root.footer, 'footer', ['enabled', 'credit'])

  let quote: WeddingContent['greeting']['quote']
  if (greeting.quote !== undefined) {
    const q = object(greeting.quote, 'greeting.quote', ['text', 'source'])
    quote = { text: string(q, 'text', 'greeting.quote', { nonEmpty: true }) }
    const source = optionalString(q, 'source', 'greeting.quote')
    if (source !== undefined) quote.source = source
  }

  let captions: Record<string, string> | undefined
  if (gallery.captions !== undefined) {
    const raw = object(gallery.captions, 'gallery.captions', Object.keys(gallery.captions ?? {}))
    captions = {}
    for (const name of Object.keys(raw)) {
      if (name.startsWith('_') || name.startsWith('$')) continue
      if (!isImageFile(name) || name.includes('/')) {
        fail(`gallery.captions.${name}`, '키는 config/images/gallery/ 안의 파일 이름(예: "03.jpg")이어야 합니다.')
      }
      captions[name] = string(raw, name, 'gallery.captions', { nonEmpty: true })
    }
  }

  const transportLinks: WeddingContent['location']['transportLinks'] = {}
  if (location.transportLinks !== undefined) {
    const links = object(location.transportLinks, 'location.transportLinks', TRANSPORT_KEYS)
    for (const key of TRANSPORT_KEYS) {
      const url = optionalString(links, key, 'location.transportLinks')
      if (url) {
        if (!url.startsWith('https://')) fail(`location.transportLinks.${key}`, 'https://로 시작하는 지도 링크여야 합니다.')
        transportLinks[key] = url
      }
    }
  }

  const event: WeddingContent['event'] = {
    startsAt: startsAt(e, 'event'),
    datePlaceholder: boolean(e, 'datePlaceholder', 'event'),
    venueName: string(e, 'venueName', 'event', { nonEmpty: true }),
    hall: string(e, 'hall', 'event'),
    address: string(e, 'address', 'event', { nonEmpty: true }),
    coords,
  }
  const addressJibun = optionalString(e, 'addressJibun', 'event')
  if (addressJibun) event.addressJibun = addressJibun
  const naverMapUrl = optionalString(e, 'naverMapUrl', 'event')
  if (naverMapUrl) event.naverMapUrl = naverMapUrl
  const venuePhone = optionalString(e, 'venuePhone', 'event')
  if (venuePhone) event.venuePhone = venuePhone

  const kakaoDescription = optionalString(share, 'kakaoDescription', 'share')

  return {
    couple: { groom: person(couple.groom, 'couple.groom'), bride: person(couple.bride, 'couple.bride') },
    event,
    cover: {
      enabled: boolean(cover, 'enabled', 'cover'),
      eyebrow: optionalString(cover, 'eyebrow', 'cover'),
      image: imageName(cover, 'image', 'cover'),
      alt: string(cover, 'alt', 'cover', { nonEmpty: true }),
    },
    greeting: { ...heading(greeting, 'greeting'), body: lines(greeting, 'body', 'greeting'), ...(quote ? { quote } : {}) },
    family: heading(family, 'family'),
    calendar: { enabled: boolean(calendar, 'enabled', 'calendar'), eyebrow: string(calendar, 'eyebrow', 'calendar') },
    gallery: {
      ...heading(gallery, 'gallery'),
      alt: string(gallery, 'alt', 'gallery', { nonEmpty: true }),
      ...(captions ? { captions } : {}),
    },
    location: { ...heading(location, 'location'), transport: transport(present(location, 'transport', 'location'), 'location.transport'), transportLinks },
    account: { ...heading(account, 'account'), intro: lines(account, 'intro', 'account') },
    rsvp: { ...heading(rsvp, 'rsvp'), intro: lines(rsvp, 'intro', 'rsvp') },
    guestbook: heading(guestbook, 'guestbook'),
    share: {
      ...heading(share, 'share'),
      intro: string(share, 'intro', 'share'),
      kakaoTitle: string(share, 'kakaoTitle', 'share', { nonEmpty: true }),
      ...(kakaoDescription?.trim() ? { kakaoDescription } : {}),
      buttonLabel: string(share, 'buttonLabel', 'share', { nonEmpty: true }),
    },
    footer: { enabled: boolean(footer, 'enabled', 'footer'), credit: string(footer, 'credit', 'footer') },
  }
}
