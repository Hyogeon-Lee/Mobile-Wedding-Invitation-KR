import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLenis } from 'lenis/react'
import type PhotoSwipe from 'photoswipe'
import { RowsPhotoAlbum, type Photo } from 'react-photo-album'
import 'react-photo-album/rows.css'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useToast } from '@/components/toast-context'
import type { GalleryImage } from '@/config/types'
import { wedding } from '@/config/wedding'
import { EASE_OUT, SCROLL_OPTIONS } from '@/lib/motion'
import { hasMore, splitTiles, toSlides, toggleLabel } from './layout'
import { openLightbox } from './lightbox'

const FRAME =
  'pressable block ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

// Rows keep each photo's own ratio and fill the width exactly; the row height tracks the width so phones get 3-4 photos per row
const rowHeight = (width: number) => width / 2.4

const toPhotos = (images: readonly GalleryImage[]): Photo[] =>
  images.map(({ src, width, height, alt }) => ({ src, width, height, alt, label: `${alt} 크게 보기` }))

interface AlbumProps {
  images: readonly GalleryImage[]
  /** Index of the first photo in the full gallery */
  offset: number
  pending: number | null
  onOpen: (index: number) => void
  tileRef: (index: number, el: HTMLButtonElement | null) => void
}

function Album({ images, offset, pending, onOpen, tileRef }: AlbumProps) {
  const photos = useMemo(() => toPhotos(images), [images])
  return (
    <RowsPhotoAlbum
      photos={photos}
      spacing={2}
      targetRowHeight={rowHeight}
      rowConstraints={{ maxPhotos: 4 }}
      onClick={({ index }) => onOpen(offset + index)}
      render={{
        button: (props, { index }) => (
          <button
            {...props}
            ref={(el) => tileRef(offset + index, el)}
            aria-busy={pending === offset + index || undefined}
            className={`${props.className} ${FRAME} ${pending === offset + index ? 'opacity-70' : ''}`}
          />
        ),
      }}
    />
  )
}

// Horizontal strip for the photos behind "more": one row at a fixed height, each photo at its own ratio, snapping per photo.
// Native scrolling (Lenis is told to leave the wheel alone) keeps it smooth on touch and trackpad.
function Strip({ images, offset, pending, onOpen, tileRef }: AlbumProps) {
  return (
    <div
      data-lenis-prevent-wheel
      className="flex snap-x snap-mandatory gap-0.5 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {images.map((image, i) => {
        const index = offset + i
        return (
          <button
            key={image.src}
            type="button"
            ref={(el) => tileRef(index, el)}
            onClick={() => onOpen(index)}
            aria-label={`${image.alt} 크게 보기`}
            aria-busy={pending === index || undefined}
            className={`${FRAME} h-55 shrink-0 snap-start ${pending === index ? 'opacity-70' : ''}`}
          >
            <img
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
              className="block h-full w-auto"
            />
          </button>
        )
      })}
    </div>
  )
}

export default function Gallery() {
  const { eyebrow, title, images } = wedding.gallery
  const reduce = useReducedMotion()
  const toast = useToast()
  const lenis = useLenis()
  const tailId = useId()

  const [expanded, setExpanded] = useState(false)
  const [pending, setPending] = useState<number | null>(null)
  const pswpRef = useRef<PhotoSwipe | null>(null)
  const openingRef = useRef(false)
  const mountedRef = useRef(true)
  const tilesRef = useRef<(HTMLButtonElement | null)[]>([])

  const { head, tail } = splitTiles(images)
  const slides = useMemo(() => toSlides(images), [images])

  const setTileRef = useCallback((index: number, el: HTMLButtonElement | null) => {
    tilesRef.current[index] = el
  }, [])

  const open = useCallback(
    async (index: number) => {
      if (openingRef.current || pswpRef.current) return
      openingRef.current = true
      setPending(index)
      try {
        const pswp = await openLightbox({
          // `element` lets PhotoSwipe zoom out of the tapped tile, and hidden tiles fall back to a fade
          dataSource: slides.map((s, i) => ({ ...s, element: tilesRef.current[i] ?? undefined })),
          index,
          onDestroy: () => {
            pswpRef.current = null
            lenis?.start()
          },
        })
        if (!mountedRef.current) {
          pswp.destroy()
          return
        }
        pswpRef.current = pswp
        lenis?.stop()
      } catch {
        if (mountedRef.current) toast.show('사진 보기를 불러오지 못했습니다. 다시 눌러 주세요.')
      } finally {
        openingRef.current = false
        if (mountedRef.current) setPending(null)
      }
    },
    [slides, lenis, toast],
  )

  // Destroy any open lightbox on unmount, its onDestroy restores Lenis
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pswpRef.current?.destroy()
      pswpRef.current = null
    }
  }, [])

  if (images.length === 0) return null

  // Collapsing from below would strand the reader in a later section
  const toggle = () => {
    if (expanded) {
      const el = document.getElementById('gallery')
      if (el && el.getBoundingClientRect().top < 0) {
        if (lenis) lenis.scrollTo(el, SCROLL_OPTIONS)
        else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      }
    }
    setExpanded((v) => !v)
  }

  return (
    <Section
      id="gallery"
      eyebrow={eyebrow}
      title={title}
      top="lg"
      bottom="sm"
    >
      <div>
        <div className="-mx-6">
          <Reveal>
            <Album images={head} offset={0} pending={pending} onOpen={open} tileRef={setTileRef} />
          </Reveal>

          <AnimatePresence initial={false}>
            {expanded && tail.length > 0 && (
              <motion.div
                id={tailId}
                key="tail"
                className="mt-0.5"
                // Opacity/transform only, since animating height would relayout every section below on each frame
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
              >
                <Strip images={tail} offset={head.length} pending={pending} onOpen={open} tileRef={setTileRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {hasMore(images.length) && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={toggle}
              aria-expanded={expanded}
              aria-controls={expanded ? tailId : undefined}
            >
              {toggleLabel(images.length, expanded)}
            </Button>
          </div>
        )}

        <p className="mt-6 text-center text-[0.9375rem] leading-[1.8] text-ink-muted">사진을 누르면 크게 볼 수 있습니다</p>
      </div>
    </Section>
  )
}
