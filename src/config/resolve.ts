import { formatDateKo } from '../lib/date.ts'
import { compareFileNames, GALLERY_PREFIX } from './content-files.ts'
import type { EventInfo, GalleryImage, WeddingConfig, WeddingContent } from './types.ts'

/** One entry per file under config/images/, keyed by its path relative to that folder ("gallery/01.jpg"). */
export interface ContentImage {
  url: string
  width: number
  height: number
}
export type ContentImages = Record<string, ContentImage>

/** "2027년 OO월 OO일" until the date is confirmed, then "2027년 5월 15일 토요일" */
export function dateLineOf(event: Pick<EventInfo, 'startsAt' | 'datePlaceholder'>): string {
  return event.datePlaceholder ? `${event.startsAt.slice(0, 4)}년 OO월 OO일` : formatDateKo(event.startsAt)
}

export function shareDescriptionOf(content: Pick<WeddingContent, 'event' | 'share'>): string {
  return content.share.kakaoDescription ?? `${dateLineOf(content.event)} · ${content.event.venueName}`
}

/** File names directly inside config/images/gallery/, in natural order. */
export function galleryFiles(images: ContentImages): string[] {
  return Object.keys(images)
    .filter((key) => key.startsWith(GALLERY_PREFIX) && !key.slice(GALLERY_PREFIX.length).includes('/'))
    .map((key) => key.slice(GALLERY_PREFIX.length))
    .sort(compareFileNames)
}

/** Turn image file names into sized URLs and fill derived defaults. Throws a Korean message when a named file is missing. */
export function resolveWedding(content: WeddingContent, images: ContentImages): WeddingConfig {
  const coverImage = images[content.cover.image]
  if (!coverImage) {
    throw new Error(`config/wedding.json 오류 — "cover.image": config/images/${content.cover.image} 파일이 없습니다.`)
  }

  const files = galleryFiles(images)
  const captions = content.gallery.captions ?? {}
  for (const name of Object.keys(captions)) {
    if (!files.includes(name)) {
      throw new Error(`config/wedding.json 오류 — "gallery.captions.${name}": config/images/gallery/${name} 파일이 없습니다.`)
    }
  }
  const galleryImages: GalleryImage[] = files.map((name, i) => {
    const { url, width, height } = images[GALLERY_PREFIX + name]
    return { src: url, width, height, alt: captions[name] ?? `${content.gallery.alt} ${i + 1}` }
  })

  const { image: _image, alt: coverAlt, ...cover } = content.cover
  const { alt: _alt, captions: _captions, ...gallery } = content.gallery
  const { photo: footerPhoto, ...footer } = content.footer
  let closingImage: GalleryImage | undefined
  if (footerPhoto) {
    const photo = images[footerPhoto.image]
    if (!photo) {
      throw new Error(`config/wedding.json 오류 — "footer.photo.image": config/images/${footerPhoto.image} 파일이 없습니다.`)
    }
    closingImage = { src: photo.url, width: photo.width, height: photo.height, alt: footerPhoto.alt }
  }
  const locationImages = (content.location.images ?? []).map(({ image, alt }, i) => {
    const photo = images[image]
    if (!photo) {
      throw new Error(`config/wedding.json 오류 — "location.images[${i}].image": config/images/${image} 파일이 없습니다.`)
    }
    return { src: photo.url, width: photo.width, height: photo.height, alt }
  })
  return {
    ...content,
    cover: { ...cover, image: { src: coverImage.url, width: coverImage.width, height: coverImage.height, alt: coverAlt } },
    gallery: { ...gallery, images: galleryImages },
    location: { ...content.location, images: locationImages },
    share: { ...content.share, kakaoDescription: shareDescriptionOf(content) },
    footer: { ...footer, ...(closingImage ? { photo: closingImage } : {}) },
  }
}
