import type { ReactNode } from 'react'

export default function PreviewNotice({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p role="note" className={`text-center ${className}`}>
      <span className="inline-block rounded-xl border border-line bg-bg-elevated px-3 py-1 text-[0.8125rem] leading-relaxed tracking-[0.02em] text-ink-muted">
        {children}
      </span>
    </p>
  )
}
