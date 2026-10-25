import { Copy } from 'lucide-react'
import Button from './Button'
import { useToast } from './toast-context'
import { copyText } from '@/lib/clipboard'

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
  return (
    <Button
      size={size}
      className={className}
      aria-label={`${label}: ${text}`}
      onClick={async () => {
        const ok = await copyText(text)
        toast.show(ok ? successMessage : '복사에 실패했습니다. 길게 눌러 복사해 주세요.')
      }}
    >
      <Copy size={14} aria-hidden="true" />
      {label}
    </Button>
  )
}
