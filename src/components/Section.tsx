import type { ReactNode } from 'react'
import { Wash, type WashTone } from '@/effects'

type Space = 'sm' | 'md' | 'lg'
const PAD_TOP: Record<Space, string> = { sm: 'pt-16', md: 'pt-20', lg: 'pt-24' }
const PAD_BOTTOM: Record<Space, string> = { sm: 'pb-12', md: 'pb-16', lg: 'pb-20' }

interface SectionProps {
  id: string
  /** Fallback heading when title is absent */
  eyebrow?: string
  title?: string
  align?: 'left' | 'center'
  /** Small chip rendered under the title, e.g. "예시 계좌" */
  badge?: ReactNode
  /** Bleed layers from @/effects; they paint at -z-10 in <main> and may extend past this section */
  backdrop?: ReactNode
  children: ReactNode
  className?: string
  top?: Space
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
  align = 'left',
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
        <header className={`relative z-20 mb-8 ${align === 'center' ? 'text-center' : 'text-left'}`}>
          {title && (
            <h2 id={`${id}-title`} className="font-serif text-[1.625rem] leading-[1.5] text-balance whitespace-pre-line text-ink">
              {title}
            </h2>
          )}
          {!title && eyebrow && <p className="font-serif text-xl text-ink">{eyebrow}</p>}
          {badge && <div className={`mt-3 flex ${align === 'center' ? 'justify-center' : ''}`}>{badge}</div>}
        </header>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  )
}
