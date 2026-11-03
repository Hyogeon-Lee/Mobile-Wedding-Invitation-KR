import Reveal from '@/components/Reveal'
import { wedding } from '@/config/wedding'

interface InterludeProps {
  /** Position in `wedding.interludes`; renders nothing when that entry is absent */
  index: number
}

/** Full-width photo between sections with a few lines over its empty upper part. Not wrapped in <Section>: no heading. */
export default function Interlude({ index }: InterludeProps) {
  const photo = wedding.interludes[index]
  if (!photo) return null
  return (
    <section aria-label={photo.alt} className="relative">
      <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async" className="block h-auto w-full" />
      {photo.lines.length > 0 && (
        <div className="absolute inset-x-0 top-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.6),rgb(255_255_255/0))] px-6 pt-14 pb-16 text-center">
          <Reveal className="font-serif text-[1.125rem] leading-[1.9] text-ink">
            {photo.lines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </Reveal>
        </div>
      )}
    </section>
  )
}
