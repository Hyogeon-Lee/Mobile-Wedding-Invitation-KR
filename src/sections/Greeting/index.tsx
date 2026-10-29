import { Fragment } from 'react'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { wedding } from '@/config/wedding'
import { REVEAL_STEP } from '@/lib/motion'
import { splitParagraphs } from './paragraphs'

export default function Greeting() {
  const { greeting, couple } = wedding
  const paragraphs = splitParagraphs(greeting.body.join('\n'))
  const quote = greeting.quote

  return (
    <Section
      id="greeting"
      eyebrow={greeting.eyebrow}
      title={greeting.title}
      align="center"
      top="lg"
      bottom="sm"
    >
      <div className="py-4">
        <Reveal className="text-center font-serif text-[1.0625rem] leading-[2.2] text-ink">
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
            <blockquote className="border-y border-line px-4 py-7 text-center">
              <p className="font-serif text-[1.0625rem] leading-loose text-ink">{quote.text}</p>
              {quote.source && (
                <footer className="mt-3 font-serif font-normal! text-[0.875rem] text-ink-muted">
                  {quote.source}
                </footer>
              )}
            </blockquote>
          </Reveal>
        )}

        <Reveal delay={quote ? REVEAL_STEP * 2 : REVEAL_STEP} className="mt-12 text-center">
          <p className="font-serif text-[1.0625rem] leading-relaxed text-ink">
            <span className="mr-1 text-[0.875rem] font-normal text-ink-muted">신랑</span> {couple.groom.name}
            <span aria-hidden="true" className="mx-3 text-ink-muted">
              ·
            </span>
            <span className="mr-1 text-[0.875rem] font-normal text-ink-muted">신부</span> {couple.bride.name}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
