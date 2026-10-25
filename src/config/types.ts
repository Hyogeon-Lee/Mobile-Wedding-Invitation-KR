/** All wedding content lives in `wedding.ts`; private data (phones, accounts) comes from `lib/private.ts`. */

export interface Parent {
  name: string
  /** true renders the deceased marker (故) before the name */
  deceased?: boolean
}

export interface Person {
  /** Family name + given name as displayed, e.g. "이OO" */
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

export type SectionId =
  | 'cover'
  | 'greeting'
  | 'family'
  | 'calendar'
  | 'gallery'
  | 'location'
  | 'account'
  | 'rsvp'
  | 'guestbook'
  | 'share'
  | 'footer'

export interface WeddingConfig {
  couple: { groom: Person; bride: Person }
  event: {
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
    /** Coordinates for the map. Mark placeholder=true until confirmed on Kakao Map. */
    coords: { lat: number; lng: number; placeholder?: boolean }
    /** Phone number of the venue, optional */
    venuePhone?: string
  }
  /** Greeting copy. Keep it secular: no scripture, prayers or religious wording (owner direction 2026-10-25). */
  greeting: { title: string; body: string; quote?: { text: string; source?: string } }
  cover: { image: GalleryImage; eyebrow?: string }
  gallery: GalleryImage[]
  transport: TransportInfo
  sections: Record<SectionId, boolean>
  share: { title: string; description: string; imagePath: string; buttonLabel: string }
  footer: { credit: string }
}
