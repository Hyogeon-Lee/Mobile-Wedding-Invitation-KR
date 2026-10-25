import { describe, expect, it, vi } from 'vitest'
import { openAppScheme, type AppSchemeDeps } from './openApp'

interface Harness {
  deps: AppSchemeDeps
  navigated: string[]
  fire: () => void
  hide: () => void
  advance: (ms: number) => void
  setVisible: (v: boolean) => void
  cancelled: () => boolean
  unsubscribed: () => boolean
}

function harness(): Harness {
  let clock = 1_000
  let visible = true
  let scheduled: (() => void) | null = null
  let hiddenHandler: (() => void) | null = null
  let cancelled = false
  let unsubscribed = false
  const navigated: string[] = []
  const deps: AppSchemeDeps = {
    navigate: (url) => {
      navigated.push(url)
    },
    isVisible: () => visible,
    now: () => clock,
    schedule: (fn) => {
      scheduled = fn
      return () => {
        cancelled = true
      }
    },
    onHidden: (fn) => {
      hiddenHandler = fn
      return () => {
        unsubscribed = true
      }
    },
  }
  return {
    deps,
    navigated,
    fire: () => scheduled?.(),
    hide: () => {
      visible = false
      hiddenHandler?.()
    },
    advance: (ms) => {
      clock += ms
    },
    setVisible: (v) => {
      visible = v
    },
    cancelled: () => cancelled,
    unsubscribed: () => unsubscribed,
  }
}

describe('openAppScheme', () => {
  it('navigates to the scheme and calls onFail when the page is still visible at timeout', () => {
    const h = harness()
    const onFail = vi.fn()
    openAppScheme('tmap://route?goalname=x', { onFail, timeoutMs: 1200 }, h.deps)
    expect(h.navigated).toEqual(['tmap://route?goalname=x'])
    h.advance(1200)
    h.fire()
    expect(onFail).toHaveBeenCalledTimes(1)
    expect(h.unsubscribed()).toBe(true)
  })

  it('does not call onFail when the page was hidden (app opened) before the timeout', () => {
    const h = harness()
    const onFail = vi.fn()
    openAppScheme('nmap://route/public', { onFail }, h.deps)
    h.hide()
    expect(h.cancelled()).toBe(true)
    h.advance(1200)
    h.fire()
    expect(onFail).not.toHaveBeenCalled()
  })

  it('does not call onFail when the timer fires late (page was suspended)', () => {
    const h = harness()
    const onFail = vi.fn()
    openAppScheme('nmap://route/public', { onFail, timeoutMs: 1200, slackMs: 500 }, h.deps)
    h.advance(5000)
    h.fire()
    expect(onFail).not.toHaveBeenCalled()
  })

  it('does not call onFail when the page is hidden at the time the timer fires', () => {
    const h = harness()
    const onFail = vi.fn()
    openAppScheme('nmap://route/public', { onFail }, h.deps)
    h.setVisible(false)
    h.advance(1200)
    h.fire()
    expect(onFail).not.toHaveBeenCalled()
  })

  it('calls onFail at most once', () => {
    const h = harness()
    const onFail = vi.fn()
    openAppScheme('tmap://route', { onFail }, h.deps)
    h.advance(1200)
    h.fire()
    h.fire()
    expect(onFail).toHaveBeenCalledTimes(1)
  })
})
