import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  /** Small uppercase label above the title, e.g. "GREETING" */
  eyebrow?: string
  title?: string
  /** Small chip rendered under the title, e.g. "예시 계좌" */
  badge?: ReactNode
  children: ReactNode
  className?: string
  /** 'plain' uses the page background, 'tinted' a soft accent band */
  tone?: 'plain' | 'tinted'
}

/** Standard vertical rhythm for every section: 72px padding, 24px gutter, centered heading. */
export default function Section({ id, eyebrow, title, badge, children, className = '', tone = 'plain' }: SectionProps) {
  const bg = tone === 'tinted' ? 'bg-accent-soft/40' : ''
  return (
    <section id={id} className={`px-6 py-18 ${bg} ${className}`} aria-labelledby={title ? `${id}-title` : undefined}>
      {(eyebrow || title || badge) && (
        <header className="mb-10 text-center">
          {eyebrow && (
            <p className="font-display text-[11px] tracking-[0.35em] text-accent uppercase mb-3">{eyebrow}</p>
          )}
          {title && (
            <h2 id={`${id}-title`} className="font-serif text-2xl font-normal leading-snug text-ink">
              {title}
            </h2>
          )}
          {badge && <div className="mt-3 flex justify-center">{badge}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
