import { useEffect, useState } from 'react'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { wedding } from '@/config/wedding'
import { WEEKDAYS_KO, daysUntil, formatDday, toKstParts } from '@/lib/date'
import { calendarTitle, ddaySentence, monthLabel } from './format'
import { calendarWeeks, isWeddingCell } from './grid'

const REFRESH_MS = 60_000
const REVEAL_STEP = 0.12

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
      <Reveal className="mx-auto max-w-[320px]">
        <table className="w-full table-fixed border-collapse">
          <caption className="caption-top pb-4 text-center font-serif text-[1.0625rem] text-ink">
            {monthLabel(target.year, target.month, datePlaceholder)}
          </caption>
          <thead>
            <tr className="border-b border-line">
              {WEEKDAYS_KO.map((w, i) => (
                <th
                  key={w}
                  scope="col"
                  abbr={`${w}요일`}
                  className={`pb-3 text-center text-[0.8125rem] font-normal tracking-wide ${i === 0 ? 'text-accent' : 'text-ink-muted'}`}
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
                    <td key={di} className="pt-2 text-center text-[0.9375rem] leading-none text-ink">
                      {day !== null && (
                        <span
                          className={`inline-flex size-9 items-center justify-center rounded-full ${
                            isWedding ? 'bg-accent font-medium text-white' : ''
                          } ${di === 0 && !isWedding ? 'text-accent' : ''}`}
                        >
                          {day}
                          {isWedding && <span className="sr-only"> 결혼식</span>}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {datePlaceholder && <p className="mt-4 text-center text-[0.9375rem] text-ink-muted">일정 확정 전 예시 달력</p>}
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-14 text-center">
        <p className="font-display text-[2.5rem] leading-none tracking-[0.06em] text-ink">
          {formatDday(days, datePlaceholder)}
        </p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink">
          {ddaySentence({ groom: couple.groom.name, bride: couple.bride.name, days, placeholder: datePlaceholder })}
        </p>
      </Reveal>
    </Section>
  )
}
