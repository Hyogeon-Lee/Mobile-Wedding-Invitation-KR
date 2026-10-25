/**
 * Large-text mode. `index.css` maps `html.text-lg-mode` to a 19px root font size,
 * so every rem-based size on the page scales together. The choice is persisted in
 * localStorage, which in-app browsers may block or throw on, hence the guards.
 */
export const TEXT_LG_STORAGE_KEY = 'wedding.textLg'
export const TEXT_LG_CLASS = 'text-lg-mode'

/** Minimal Storage surface so tests can pass a fake and the helpers stay DOM-free. */
export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface ClassListLike {
  classList: { toggle(token: string, force?: boolean): boolean }
}

/** Reading `localStorage` itself throws when site data is blocked, so the lookup is guarded. */
export function safeLocalStorage(): StorageLike | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

/** true when the viewer previously turned large text on. Any failure reads as "off". */
export function readTextLg(store: StorageLike | null = safeLocalStorage()): boolean {
  try {
    return store?.getItem(TEXT_LG_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Persists the choice. Private mode or a full quota only loses persistence, not the mode itself. */
export function writeTextLg(enabled: boolean, store: StorageLike | null = safeLocalStorage()): void {
  try {
    store?.setItem(TEXT_LG_STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    // ignored: the class on <html> still applies for this visit
  }
}

export function applyTextLg(root: ClassListLike, enabled: boolean): void {
  root.classList.toggle(TEXT_LG_CLASS, enabled)
}

/** Native scroll behavior for "맨 위로": instant when the viewer prefers reduced motion. */
export function scrollTopBehavior(reducedMotion: boolean): ScrollBehavior {
  return reducedMotion ? 'auto' : 'smooth'
}
