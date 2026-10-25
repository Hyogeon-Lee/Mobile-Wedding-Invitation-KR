import { describe, expect, it, vi } from 'vitest'
import {
  TEXT_LG_CLASS,
  TEXT_LG_STORAGE_KEY,
  applyTextLg,
  readTextLg,
  scrollTopBehavior,
  writeTextLg,
  type StorageLike,
} from './textSize'

function memoryStore(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

const throwingStore: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

describe('readTextLg', () => {
  it('is off when nothing was stored', () => {
    expect(readTextLg(memoryStore())).toBe(false)
  })
  it('is on only for the exact stored value "1"', () => {
    expect(readTextLg(memoryStore({ [TEXT_LG_STORAGE_KEY]: '1' }))).toBe(true)
    expect(readTextLg(memoryStore({ [TEXT_LG_STORAGE_KEY]: '0' }))).toBe(false)
    expect(readTextLg(memoryStore({ [TEXT_LG_STORAGE_KEY]: 'true' }))).toBe(false)
  })
  it('treats a missing or throwing store as off', () => {
    expect(readTextLg(null)).toBe(false)
    expect(readTextLg(throwingStore)).toBe(false)
  })
})

describe('writeTextLg', () => {
  it('stores "1" / "0" under the wedding.textLg key', () => {
    const store = memoryStore()
    writeTextLg(true, store)
    expect(store.data.get('wedding.textLg')).toBe('1')
    writeTextLg(false, store)
    expect(store.data.get('wedding.textLg')).toBe('0')
  })
  it('round-trips through readTextLg', () => {
    const store = memoryStore()
    writeTextLg(true, store)
    expect(readTextLg(store)).toBe(true)
    writeTextLg(false, store)
    expect(readTextLg(store)).toBe(false)
  })
  it('swallows storage errors and a missing store', () => {
    expect(() => writeTextLg(true, throwingStore)).not.toThrow()
    expect(() => writeTextLg(true, null)).not.toThrow()
  })
})

describe('applyTextLg', () => {
  it('forces the mode class on or off via classList.toggle', () => {
    const toggle = vi.fn<(token: string, force?: boolean) => boolean>(() => true)
    const root = { classList: { toggle } }
    applyTextLg(root, true)
    applyTextLg(root, false)
    expect(toggle).toHaveBeenNthCalledWith(1, TEXT_LG_CLASS, true)
    expect(toggle).toHaveBeenNthCalledWith(2, TEXT_LG_CLASS, false)
    expect(TEXT_LG_CLASS).toBe('text-lg-mode')
  })
})

describe('scrollTopBehavior', () => {
  it('is smooth unless the viewer prefers reduced motion', () => {
    expect(scrollTopBehavior(false)).toBe('smooth')
    expect(scrollTopBehavior(true)).toBe('auto')
  })
})
