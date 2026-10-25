import { ToastProvider } from '@/components/Toast'
import SmoothScroll from '@/components/SmoothScroll'
import { wedding } from '@/config/wedding'

// Sections are added in src/sections/<Name>/index.tsx and registered here in page order.
export default function App() {
  return (
    <ToastProvider>
      <SmoothScroll>
        <main className="app-frame">
          <p className="p-6 text-center text-ink-muted">
            {wedding.couple.groom.name} · {wedding.couple.bride.name} — 섹션 구현 전 임시 화면
          </p>
        </main>
      </SmoothScroll>
    </ToastProvider>
  )
}
