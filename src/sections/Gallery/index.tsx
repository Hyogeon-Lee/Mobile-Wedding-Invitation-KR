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
import { CurtainLight } from '@/effects'
import { asset } from '@/lib/env'
import { EASE_OUT } from '@/lib/motion'
import { hasMore, spansBothColumns, splitTiles, tileTilt, toSlides, toggleLabel } from './layout'
import { openLightbox } from './lightbox'

// gap-3 leaves room for the opposite tilts of neighbouring frames so their corners never touch.
const GRID = 'grid grid-cols-2 gap-3'
// Soft polaroid frame: 6px white mat, hairline ring, faint sage-tinted drop shadow.
const FRAME =
  'block w-full overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-line/70 ' +
  'shadow-(--shadow-soft) ' +
  'transition-[rotate,scale,opacity] duration-300 ease-out active:scale-[0.98] active:duration-(--press-duration) motion-reduce:transition-none motion-reduce:active:scale-100 ' +
  'hover:rotate-0 focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

interface TileProps {
  image: GalleryImage
  index: number
  busy: boolean
  onOpen: (index: number) => void
  tileRef: (index: number, el: HTMLButtonElement | null) => void
}

function Tile({ image, index, busy, onOpen, tileRef }: TileProps) {
  return (
    <button
      type="button"
      ref={(el) => tileRef(index, el)}
      onClick={() => onOpen(index)}
      aria-label={`${image.alt} 크게 보기`}
      aria-busy={busy || undefined}
      className={`${FRAME} ${tileTilt(index)} ${spansBothColumns(index) ? 'col-span-2' : ''} ${busy ? 'opacity-70' : ''}`}
    >
      <img
        src={asset(image.src)}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
        className="block h-auto w-full rounded-[6px] bg-accent-soft/60 object-cover"
      />
    </button>
  )
}

export default function Gallery() {
  const images = wedding.gallery
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
  const slides = useMemo(() => toSlides(images, asset), [images])

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
          // `element` lets PhotoSwipe zoom out of the tapped tile; hidden tiles fall back to a fade.
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

  // Destroy any open lightbox when the section unmounts; `onDestroy` restores Lenis.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pswpRef.current?.destroy()
      pswpRef.current = null
    }
  }, [])

  if (images.length === 0) return null

  // The tail can run past 1,000px; collapsing from below would strand the reader in a later section.
  const toggle = () => {
    if (expanded) {
      const el = document.getElementById('gallery')
      if (el && el.getBoundingClientRect().top < 0) {
        if (lenis) lenis.scrollTo(el, { duration: 0.6 })
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
    <Section id="gallery" eyebrow="GALLERY" title="우리의 순간">
      <Reveal amount="some">
        {/* Warm curtain light pooling over the first rows, as if from a window above the top-right frame.
            The light box is capped at 60rem: rotated bands shift sideways by (h/2)·tan θ at the edges, so on the
            full ~2,000 px stage they would leave the top-right corner unlit. Edges fade through static bg
            overlays instead of a mask on the animated layer, which would add a mask pass every frame. */}
        <div className="relative isolate -mx-6 overflow-hidden px-6 py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(100%,60rem)] overflow-hidden"
          >
            <CurtainLight tone="warm" intensity="soft" bands={5} angle={-12} seed={3} />
            <div className="absolute inset-x-0 top-0 z-[1] h-16 bg-linear-to-b from-bg to-transparent" />
            <div className="absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-linear-to-t from-bg to-transparent" />
          </div>

          <div className="relative z-10">
            <div className={GRID}>{tiles(head, 0)}</div>

            <AnimatePresence initial={false}>
              {expanded && tail.length > 0 && (
                <motion.div
                  id={tailId}
                  key="tail"
                  // Opacity/transform only: animating height would relayout every section below on each frame.
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: EASE_OUT }}
                >
                  <div className={`${GRID} pt-3`}>{tiles(tail, head.length)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
      </Reveal>
    </Section>
  )
}
