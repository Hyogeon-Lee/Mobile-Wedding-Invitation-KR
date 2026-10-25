import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50'
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-bg hover:bg-ink/90 active:bg-ink/80',
  outline: 'border border-line bg-bg-elevated text-ink hover:bg-accent-soft/60 active:bg-accent-soft',
  ghost: 'text-ink-muted hover:text-ink',
}
const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-12 px-6 text-[15px]',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** Pill button. Renders <a> when href is given (tel:, sms:, deep links), otherwise <button>. */
export default function Button(props: ButtonProps | AnchorProps) {
  const { variant = 'outline', size = 'md', className = '', children } = props
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as AnchorProps
    return (
      <a className={cls} {...rest}>
        {children}
      </a>
    )
  }
  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonProps
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}
