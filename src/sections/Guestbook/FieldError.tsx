import { AlertCircle } from 'lucide-react'

interface FieldErrorProps {
  id: string
  message?: string | null
  className?: string
}

export default function FieldError({ id, message, className = 'mt-2' }: FieldErrorProps) {
  if (!message) return null
  return (
    <p id={id} role="alert" className={`${className} flex items-start gap-1.5 text-[0.9375rem] leading-relaxed text-ink`}>
      <AlertCircle size={15} aria-hidden="true" className="mt-[5px] shrink-0 text-accent" />
      <span>{message}</span>
    </p>
  )
}
