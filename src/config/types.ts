/**
 * `WeddingContent` mirrors config/wedding.json as written by hand; `WeddingConfig` is the same data after
 * `resolve.ts` resolved image file names into URLs and filled defaults. Private data (phones, accounts)
 * comes from `lib/private.ts`, never from the JSON.
 */

export interface Parent {
  name: string
  /** true renders the deceased marker (故) before the name */
  deceased?: boolean
}

export interface Person {
  name: string
  /** "장남", "차녀" ... shown next to the parents' names */
  relation: string
  father?: Parent
  mother?: Parent
}

export interface GalleryImage {
  src: string
  width: number
  height: number
  alt: string
}

export interface TransportInfo {
  subway?: string[]
  bus?: string[]
  car?: string[]
  parking?: string[]
  shuttle?: string[]
}

export interface SectionHeading {
  enabled: boolean
  eyebrow: string
  title: string
}

export interface EventInfo {
  /** ISO 8601 with +09:00 offset. Used for calendar, weekday and D-day. */
  startsAt: string
  /**
   * true while the date is still "OO월 OO일": formatters print placeholders
   * and the D-day counter prints "D-OOO" instead of a number.
   */
  datePlaceholder: boolean
  venueName: string
  hall: string
  address: string
  /** Legacy lot-number address, shown as secondary line when present */
  addressJibun?: string
  naverMapUrl?: string
  /** Coordinates for the map. Mark placeholder=true until confirmed on Kakao Map. */
  coords: { lat: number; lng: number; placeholder?: boolean }
  venuePhone?: string
}

export interface WeddingContent {
  couple: { groom: Person; bride: Person }
  event: EventInfo
  cover: { enabled: boolean; eyebrow?: string; /** file name under config/images/ */ image: string; alt: string }
  /** Keep it secular: no scripture, prayers or religious wording (owner direction 2026-10-25). */
  greeting: SectionHeading & {
    /** One entry per line; "" starts a new paragraph. */
    body: string[]
    quote?: { text: string; source?: string }
  }
  family: SectionHeading
  /** The title is derived from the date. */
  calendar: { enabled: boolean; eyebrow: string }
  gallery: SectionHeading & {
    /** Base alt text; the photo number is appended ("신랑 신부 사진 3"). */
    alt: string
    /** Alt text per file name in config/images/gallery/, e.g. { "03.jpg": "..." } */
    captions?: Record<string, string>
  }
  location: SectionHeading & { transport: TransportInfo; transportLinks?: Partial<Record<keyof TransportInfo, string>> }
  account: SectionHeading & { intro: string[] }
  rsvp: SectionHeading & { intro: string[] }
  guestbook: SectionHeading
  share: SectionHeading & {
    intro: string
    /** Title of the KakaoTalk card, the browser tab and og:title */
    kakaoTitle: string
    /** Defaults to the formatted date line, " · ", then the venue name */
    kakaoDescription?: string
    buttonLabel: string
  }
  footer: { enabled: boolean; credit: string }
}

export interface WeddingConfig extends Omit<WeddingContent, 'cover' | 'gallery' | 'share'> {
  cover: Omit<WeddingContent['cover'], 'image' | 'alt'> & { image: GalleryImage }
  gallery: Omit<WeddingContent['gallery'], 'alt' | 'captions'> & { images: GalleryImage[] }
  share: WeddingContent['share'] & { kakaoDescription: string }
}
