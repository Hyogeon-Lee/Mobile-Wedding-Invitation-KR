import { Fragment } from 'react'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { wedding } from '@/config/wedding'
import { splitParagraphs } from './paragraphs'

const REVEAL_STEP = 0.12

export default function Greeting() {
  const { greeting, couple } = wedding
  const paragraphs = splitParagraphs(greeting.body)
  const quote = greeting.quote

  return (
    <Section id="greeting" eyebrow="INVITATION" title={greeting.title}>
      <Reveal className="text-center font-serif text-[17px] leading-loose text-ink">
        {paragraphs.map((lines, pi) => (
          <p key={pi} className={pi > 0 ? 'mt-6' : undefined}>
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        ))}
      </Reveal>

      {quote && (
        <Reveal delay={REVEAL_STEP} className="mt-12">
          <blockquote className="border-y border-line py-6 text-center">
            <p className="text-[15px] leading-relaxed text-ink-muted">{quote.text}</p>
            {quote.source && (
              <footer className="mt-3 font-display text-[11px] tracking-[0.3em] text-ink-muted uppercase">
                {quote.source}
              </footer>
            )}
          </blockquote>
        </Reveal>
      )}

      <Reveal delay={quote ? REVEAL_STEP * 2 : REVEAL_STEP} className="mt-12 text-center">
        <p className="font-serif text-[17px] leading-relaxed text-ink">
          <span className="text-ink-muted">신랑</span> {couple.groom.name}
          <span aria-hidden="true" className="mx-3 text-ink-muted">
            ·
          </span>
          <span className="text-ink-muted">신부</span> {couple.bride.name}
        </p>
      </Reveal>
    </Section>
  )
}
