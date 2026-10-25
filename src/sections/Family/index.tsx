import { Phone } from 'lucide-react'
import { Fragment, useCallback, useState } from 'react'
import Button from '@/components/Button'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import type { Parent, Person } from '@/config/types'
import { wedding } from '@/config/wedding'
import { REVEAL_STEP } from '@/lib/motion'
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

function FamilyRow({ side, person }: { side: Side; person: Person }) {
  const parents = presentParents(person)
  return (
    <div className="py-6 text-center">
      <p className="text-[0.8125rem] tracking-[0.02em] text-accent">{SIDE_LABEL[side]}</p>
      {parents.length > 0 && (
        <p className="mt-3 text-[0.9375rem] leading-[1.8] text-ink-muted">
          {parents.map((parent, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <span aria-hidden="true" className="mx-2">
                  ·
                </span>
              )}
              <ParentName parent={parent} />
            </Fragment>
          ))}
          <span>의 {person.relation}</span>
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
      wash="mint"
    >
      <Reveal>
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-bg-elevated px-6 py-2">
          {SIDES.map((side) => (
            <FamilyRow key={side} side={side} person={wedding.couple[side]} />
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
