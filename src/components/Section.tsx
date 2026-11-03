import type { ReactNode } from 'react'

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
  /** Line-art ornament under the title, e.g. <LineArt name="rings" /> */
  ornament?: ReactNode
  children: ReactNode
  className?: string
  top?: Space
  bottom?: Space
}

export default function Section({
  id,
  eyebrow,
  title,
  align = 'center',
  badge,
  ornament,
  children,
  className = '',
  top = 'md',
  bottom = 'md',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative px-6 ${PAD_TOP[top]} ${PAD_BOTTOM[bottom]} ${className}`}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {(eyebrow || title || badge || ornament) && (
        <header className={`relative z-20 mb-8 ${align === 'center' ? 'text-center' : 'text-left'}`}>
          {title && (
            <h2 id={`${id}-title`} className="font-serif text-[1.375rem] leading-[1.6] text-balance whitespace-pre-line text-ink">
              {title}
            </h2>
          )}
          {!title && eyebrow && <p className="font-serif text-xl text-ink">{eyebrow}</p>}
          {badge && <div className={`mt-3 flex ${align === 'center' ? 'justify-center' : ''}`}>{badge}</div>}
          {ornament && <div className={`mt-5 flex text-accent ${align === 'center' ? 'justify-center' : ''}`}>{ornament}</div>}
        </header>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  )
}
