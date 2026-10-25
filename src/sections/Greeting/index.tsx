import { Fragment } from 'react'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { wedding } from '@/config/wedding'
import { LightBloom, PetalDrift } from '@/effects'
import { splitParagraphs } from './paragraphs'

const REVEAL_STEP = 0.12

export default function Greeting() {
  const { greeting, couple } = wedding
  const paragraphs = splitParagraphs(greeting.body)
  const quote = greeting.quote

  return (
    <Section id="greeting" eyebrow="INVITATION" title={greeting.title}>
      {/* Full-bleed light stage under the heading; edges are masked so the bloom fades out instead of being clipped. */}
      <div className="relative isolate -mx-6 overflow-hidden px-6 py-10">
        <LightBloom palette={['mint', 'butter']} intensity="soft" className="mask-x-from-88% mask-y-from-80%" />
        <PetalDrift count={6} seed={2} density="light" className="z-0" />

        <div className="relative z-10">
          <Reveal className="text-center font-serif text-[1.0625rem] leading-loose text-ink">
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
              <blockquote className="rounded-2xl border border-line bg-bg-elevated/75 px-6 py-7 text-center">
                <p className="font-serif text-[1.0625rem] leading-loose text-ink">{quote.text}</p>
                {quote.source && (
                  <footer className="mt-3 font-serif text-[0.875rem] text-ink-muted">
                    {quote.source}
                  </footer>
                )}
              </blockquote>
            </Reveal>
          )}

          <Reveal delay={quote ? REVEAL_STEP * 2 : REVEAL_STEP} className="mt-12 text-center">
            <p className="font-serif text-[1.0625rem] leading-relaxed text-ink">
              <span className="mr-1 text-[0.875rem] text-ink-muted">신랑</span> {couple.groom.name}
              <span aria-hidden="true" className="mx-3 text-ink-muted">
                ·
              </span>
              <span className="mr-1 text-[0.875rem] text-ink-muted">신부</span> {couple.bride.name}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
