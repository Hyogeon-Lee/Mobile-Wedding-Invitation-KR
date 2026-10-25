/**
 * Opens an app scheme (nmap://, tmap://) by navigating the current page and detects
 * "app not installed" by elapsed time: when the app opens, the page is hidden (or the
 * timer is suspended) before `timeoutMs`; when nothing happens the page stays visible
 * and `onFail` runs. Dependencies are injectable so the logic is testable without a DOM.
 */
export interface AppSchemeDeps {
  /** Navigate the current page to the scheme URL. */
  navigate: (url: string) => void
  /** true while the page is on screen; an opened app hides it. */
  isVisible: () => boolean
  now: () => number
  /** Run fn after ms; returns a cancel function. */
  schedule: (fn: () => void, ms: number) => () => void
  /** Call fn once the page is hidden or unloaded; returns an unsubscribe function. */
  onHidden: (fn: () => void) => () => void
}

export interface AppSchemeOptions {
  /** How long to wait for the app before `onFail` (default 1200 ms). */
  timeoutMs?: number
  /**
   * Browsers pause timers while the page is in the background, so a timer that fires
   * later than timeoutMs + slackMs means the app took over and nothing failed.
   */
  slackMs?: number
  onFail: () => void
}

function browserDeps(): AppSchemeDeps {
  return {
    navigate: (url) => {
      window.location.href = url
    },
    isVisible: () => document.visibilityState === 'visible',
    now: () => Date.now(),
    schedule: (fn, ms) => {
      const id = window.setTimeout(fn, ms)
      return () => window.clearTimeout(id)
    },
    onHidden: (fn) => {
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') fn()
      }
      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('pagehide', fn)
      return () => {
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('pagehide', fn)
      }
    },
  }
}

export function openAppScheme(
  url: string,
  { timeoutMs = 1200, slackMs = 500, onFail }: AppSchemeOptions,
  deps: AppSchemeDeps = browserDeps(),
): void {
  const start = deps.now()
  let settled = false
  let cancelTimer: () => void = () => {}
  let unsubscribe: () => void = () => {}

  const settle = () => {
    settled = true
    cancelTimer()
    unsubscribe()
  }

  unsubscribe = deps.onHidden(settle)
  cancelTimer = deps.schedule(() => {
    if (settled) return
    settle()
    const firedLate = deps.now() - start > timeoutMs + slackMs
    if (firedLate || !deps.isVisible()) return
    onFail()
  }, timeoutMs)

  deps.navigate(url)
}
