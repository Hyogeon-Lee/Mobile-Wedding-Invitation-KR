import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLenis } from 'lenis/react'
import type PhotoSwipe from 'photoswipe'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useToast } from '@/components/toast-context'
import type { GalleryImage } from '@/config/types'
import { wedding } from '@/config/wedding'
import { Bleed, Daylight } from '@/effects'
import { EASE_OUT, SCROLL_OPTIONS } from '@/lib/motion'
import { hasMore, splitTiles, toSlides, toggleLabel } from './layout'
import { openLightbox } from './lightbox'

const GRID = 'grid grid-cols-2 gap-4'
const FRAME =
  'pressable block w-full ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent'

interface TileProps {
  image: GalleryImage
  index: number
  busy: boolean
  onOpen: (index: number) => void
  tileRef: (index: number, el: HTMLButtonElement | null) => void
}

function Tile({ image, index, busy, onOpen, tileRef }: TileProps) {
  return (
    <Reveal className={image.width > image.height ? 'col-span-2' : undefined}>
      <button
        type="button"
        ref={(el) => tileRef(index, el)}
        onClick={() => onOpen(index)}
        aria-label={`${image.alt} 크게 보기`}
        aria-busy={busy || undefined}
        className={`${FRAME} ${busy ? 'opacity-70' : ''}`}
      >
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          style={{ aspectRatio: `${image.width} / ${image.height}` }}
          className="photo-feather block h-auto w-full object-cover"
        />
      </button>
    </Reveal>
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
          dataSource: slides.map((s, i) => ({ ...s, element: tilesRef.current[i] ?? undefined, thumbCropped: true })),
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

  // The tail can run past 1,000px, and collapsing from below would strand the reader in a later section
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

  const tiles = (list: GalleryImage[], offset: number) =>
    list.map((image, i) => (
      <Tile
        key={image.src}
        image={image}
        index={offset + i}
        busy={pending === offset + i}
        onOpen={open}
        tileRef={setTileRef}
      />
    ))

  return (
    <Section
      id="gallery"
      eyebrow={eyebrow}
      title={title}
      top="lg"
      bottom="sm"
      backdrop={
        <Bleed top="-12rem" bottom="-12rem" mask="y" fade="12rem">
          <Daylight />
        </Bleed>
      }
    >
      <div>
        <div className="py-6">
          <div className={GRID}>{tiles(head, 0)}</div>

          <AnimatePresence initial={false}>
            {expanded && tail.length > 0 && (
              <motion.div
                id={tailId}
                key="tail"
                // Opacity/transform only, since animating height would relayout every section below on each frame
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
              >
                <div className={`${GRID} pt-4`}>{tiles(tail, head.length)}</div>
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
