import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import { useToast } from './toast-context'
import { copyText } from '@/lib/clipboard'
import { haptic } from '@/lib/haptic'

interface CopyButtonProps {
  text: string
  label?: string
  successMessage?: string
  size?: 'sm' | 'md'
  className?: string
}

/** Copies `text` and reports via toast; falls back to execCommand in in-app browsers. */
export default function CopyButton({
  text,
  label = '복사',
  successMessage = '복사되었습니다',
  size = 'sm',
  className,
}: CopyButtonProps) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )
  return (
    <Button
      size={size}
      className={className}
      aria-label={`${label}: ${text}`}
      onClick={async () => {
        const ok = await copyText(text)
        toast.show(ok ? successMessage : '복사에 실패했습니다. 길게 눌러 복사해 주세요.')
        if (ok) {
          haptic()
          setCopied(true)
          if (timer.current) window.clearTimeout(timer.current)
          timer.current = window.setTimeout(() => setCopied(false), 1600)
        }
      }}
    >
      <span aria-hidden="true" className="inline-grid size-3.5 place-items-center">
        <Copy
          size={14}
          className={`col-start-1 row-start-1 transition-[opacity,scale] duration-200 ease-out motion-reduce:scale-100 ${copied ? 'scale-75 opacity-0' : 'opacity-100'}`}
        />
        <Check
          size={14}
          className={`col-start-1 row-start-1 text-accent transition-[opacity,scale] duration-200 ease-out motion-reduce:scale-100 ${copied ? 'opacity-100' : 'scale-75 opacity-0'}`}
        />
      </span>
      {label}
    </Button>
  )
}
