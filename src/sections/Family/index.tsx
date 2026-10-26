import { Phone } from 'lucide-react'
import { Fragment, useCallback, useState } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import type { Parent, Person } from '@/config/types'
import { wedding } from '@/config/wedding'
import { REVEAL_STEP } from '@/lib/motion'
import { Bleed, Daylight } from '@/effects'
import { contacts, isSampleData } from '@/lib/private'
import ContactSheet from './ContactSheet'
import { buildContactGroups, DECEASED_MARK, presentParents, SIDE_LABEL, SIDES, THIN_SPACE, type Side } from './family'

const groups = buildContactGroups(wedding.couple, contacts)

function ParentName({ parent }: { parent: Parent }) {
  return (
    <>
      {parent.deceased && (
        <span className="text-[0.9em] text-ink-muted">
          {DECEASED_MARK}
          {THIN_SPACE}
        </span>
      )}
      {parent.name}
    </>
  )
}

function FamilyColumn({ side, person }: { side: Side; person: Person }) {
  const parents = presentParents(person)
  return (
    <div className="min-w-0 py-4 text-center">
      <p className="text-[0.8125rem] tracking-[0.02em] text-accent">{SIDE_LABEL[side]} 측</p>
      {parents.length > 0 && (
        <p className="mt-3 text-[0.9375rem] leading-[1.8] text-ink-muted">
          {parents.map((parent, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <span aria-hidden="true" className="mx-1">
                  ·
                </span>
              )}
              <span className="inline-block"><ParentName parent={parent} /></span>
            </Fragment>
          ))}
          <span className="block">의 {person.relation}</span>
        </p>
      )}
      <p className={`${parents.length > 0 ? 'mt-1' : 'mt-3'} font-serif text-[1.25rem] leading-snug text-ink`}>
        {person.name}
      </p>
    </div>
  )
}

export default function Family() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <Section
      id="family"
      eyebrow={wedding.family.eyebrow}
      title={wedding.family.title}
      top="sm"
      bottom="md"
      backdrop={
        <Bleed top="-6rem" bottom="-6rem" mask="y" fade="12rem">
          <Daylight />
        </Bleed>
      }
    >
      <Reveal>
        <div className="grid grid-cols-2 gap-4">
          {SIDES.map((side) => (
            <FamilyColumn key={side} side={side} person={wedding.couple[side]} />
          ))}
        </div>
      </Reveal>

      {groups.length > 0 && (
        <Reveal delay={REVEAL_STEP} className="mt-8 flex justify-center">
          <Button variant="primary" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
            <Phone size={16} aria-hidden="true" />
            연락하기
          </Button>
        </Reveal>
      )}

      <ContactSheet open={open} onClose={close} groups={groups} sample={isSampleData} />
    </Section>
  )
}
