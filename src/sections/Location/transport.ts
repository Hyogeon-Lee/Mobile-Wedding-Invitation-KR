import type { TransportInfo } from '@/config/types'

/** Display order of the transport blocks. */
export const TRANSPORT_ORDER = ['subway', 'bus', 'car', 'parking', 'shuttle'] as const

export type TransportKey = (typeof TRANSPORT_ORDER)[number]

export const TRANSPORT_LABEL: Record<TransportKey, string> = {
  subway: '지하철',
  bus: '버스',
  car: '자가용',
  parking: '주차',
  shuttle: '셔틀',
}

export interface TransportEntry {
  key: TransportKey
  label: string
  lines: string[]
}

/** Blocks in display order; a key is included only when it has at least one non-blank line. */
export function transportEntries(transport: TransportInfo): TransportEntry[] {
  const entries: TransportEntry[] = []
  for (const key of TRANSPORT_ORDER) {
    const lines = (transport[key] ?? []).map((line) => line.trim()).filter((line) => line.length > 0)
    if (lines.length === 0) continue
    entries.push({ key, label: TRANSPORT_LABEL[key], lines })
  }
  return entries
}
