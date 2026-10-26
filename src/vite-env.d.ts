/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_JS_KEY?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_BASE?: string
  readonly VITE_ACCOUNTS?: string
  readonly VITE_APPS_SCRIPT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  Kakao?: {
    isInitialized: () => boolean
    init: (key: string) => void
    Share: {
      sendDefault: (settings: Record<string, unknown>) => void
    }
  }
}
