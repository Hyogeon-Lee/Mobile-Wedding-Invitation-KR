import type { ReactNode } from 'react'
import { Wash, type WashTone } from '@/effects'

type Space = 'sm' | 'md' | 'lg'
const PAD_TOP: Record<Space, string> = { sm: 'pt-12', md: 'pt-14', lg: 'pt-16' }
const PAD_BOTTOM: Record<Space, string> = { sm: 'pb-12', md: 'pb-14', lg: 'pb-16' }

interface SectionProps {
  id: string
  /** Small uppercase label above the title, e.g. "GREETING" */
  eyebrow?: string
  title?: string
  /** Small chip rendered under the title, e.g. "예시 계좌" */
  badge?: ReactNode
  /** Bleed layers from @/effects; they paint at -z-10 in <main> and may extend past this section */
  backdrop?: ReactNode
  children: ReactNode
  className?: string
  /** Padding above: sm 48px, md 56px, lg 64px. Default md */
  top?: Space
  /** Padding below: sm 48px, md 56px, lg 64px. Default md */
  bottom?: Space
  /** Static tint that feathers 160px into both neighbours */
  wash?: WashTone
}

/**
 * Never isolated or clipped: washes and bleeds live in <main>'s stacking context, so they cross section edges.
 * The header sits above the content layer so light inside the content passes under it.
 */
export default function Section({
  id,
  eyebrow,
  title,
  badge,
  backdrop,
  children,
  className = '',
  top = 'md',
  bottom = 'md',
  wash,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative px-6 ${PAD_TOP[top]} ${PAD_BOTTOM[bottom]} ${className}`}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {wash && <Wash tone={wash} />}
      {backdrop}
      {(eyebrow || title || badge) && (
        <header className="relative z-20 mb-8 text-center">
          {eyebrow && (
            <p className="font-display text-[0.875rem] tracking-[0.28em] text-accent uppercase mb-3">{eyebrow}</p>
          )}
          {title && (
            <h2 id={`${id}-title`} className="font-serif text-2xl leading-snug whitespace-pre-line text-ink">
              {title}
            </h2>
          )}
          {badge && <div className="mt-3 flex justify-center">{badge}</div>}
        </header>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  )
}
