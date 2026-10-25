/** 10 ms tick on success/commit moments. iOS Safari and WKWebView have no Vibration API, so this is Android-only. */
export function haptic(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10)
  } catch {
    /* unsupported or blocked */
  }
}
