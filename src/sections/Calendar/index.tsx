import { useEffect, useState } from 'react'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { GlowPulse, LightBloom } from '@/effects'
import { wedding } from '@/config/wedding'
import { WEEKDAYS_KO, daysUntil, formatDday, toKstParts } from '@/lib/date'
import { REVEAL_STEP } from '@/lib/motion'
import { calendarTitle, ddaySentence, monthLabel } from './format'
import { calendarWeeks, isWeddingCell } from './grid'

const REFRESH_MS = 60_000
/** Mint glow behind the wedding-day circle; small enough to stay clear of neighbouring day numbers. */
const DAY_GLOW_PX = 56
const BLOOM_CLASS = 'opacity-60'

export default function Calendar() {
  const { couple, event } = wedding
  const { startsAt, datePlaceholder } = event
  const target = toKstParts(startsAt)
  const weeks = calendarWeeks(target.year, target.month)

  const [days, setDays] = useState(() => daysUntil(startsAt))
  useEffect(() => {
    const refresh = () => setDays(daysUntil(startsAt))
    refresh()
    const id = window.setInterval(refresh, REFRESH_MS)
    // In-app browsers pause timers in the background; recompute when the tab returns.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [startsAt])

  return (
    <Section id="calendar" eyebrow="SAVE THE DATE" title={calendarTitle(event)}>
      <Reveal className="mx-auto max-w-[340px]">
        <div className="relative isolate overflow-hidden rounded-2xl border border-line bg-bg-elevated px-2.5 pt-6 pb-5">
          {/* Dimmed so the peak mint tint keeps text-accent / text-ink-muted at or above 4.5:1 on this card. */}
          <LightBloom palette={['mint', 'butter', 'mint']} className={BLOOM_CLASS} />
          <table className="relative z-10 w-full table-fixed border-collapse">
            <caption className="caption-top pb-4 text-center font-serif text-[1.0625rem] text-ink-muted">
              {monthLabel(target.year, target.month, datePlaceholder)}
            </caption>
            <thead>
              <tr className="border-b border-line">
                {WEEKDAYS_KO.map((w, i) => (
                  <th
                    key={w}
                    scope="col"
                    abbr={`${w}요일`}
                    className={`pb-3 text-center text-[0.8125rem] font-normal tracking-[0.02em] ${i === 0 ? 'text-accent' : 'text-ink-muted'}`}
                  >
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((day, di) => {
                    const isWedding = isWeddingCell(day, target.day, datePlaceholder)
                    return (
                      <td key={di} className="pt-2 text-center font-display text-[1.0625rem] leading-none tabular-nums text-ink">
                        {day !== null && !isWedding && (
                          <span
                            className={`inline-flex aspect-square w-9 max-w-full items-center justify-center rounded-full ${di === 0 ? 'text-accent' : ''}`}
                          >
                            {day}
                          </span>
                        )}
                        {isWedding && (
                          <GlowPulse color="mint" size={DAY_GLOW_PX}>
                            <span className="inline-flex aspect-square w-9 max-w-full items-center justify-center rounded-full bg-accent font-medium text-white">
                              {day}
                              <span className="sr-only"> 결혼식</span>
                            </span>
                          </GlowPulse>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {datePlaceholder && (
            <p className="relative z-10 mt-4 text-center text-[0.9375rem] text-ink-muted">일정 확정 전 예시 달력</p>
          )}
        </div>
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-14 text-center">
        <p className="font-display text-[2.5rem] leading-none tracking-[-0.01em] tabular-nums lining-nums text-orange">
          {formatDday(days, datePlaceholder)}
        </p>
        <p className="mt-4 text-[0.9375rem] leading-[1.8] text-ink">
          {ddaySentence({ groom: couple.groom.name, bride: couple.bride.name, days, placeholder: datePlaceholder })}
        </p>
      </Reveal>
    </Section>
  )
}
