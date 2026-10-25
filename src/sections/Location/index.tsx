import { Bus, BusFront, Car, ParkingCircle, TrainFront, type LucideIcon } from 'lucide-react'
import { lazy, Suspense, useCallback, useMemo, useState, type MouseEvent } from 'react'
import CopyButton from '@/components/CopyButton'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useToast } from '@/components/toast-context'
import { wedding } from '@/config/wedding'
import { asset } from '@/lib/env'
import { siteUrl } from '@/lib/kakao'
import MapBoundary from './MapBoundary'
import { hostOf, kakaoNaviUrl, naverAppUrl, naverWebUrl, tmapUrl } from './links'
import { openAppScheme, openWebUrl } from './openApp'
import { transportEntries, type TransportKey } from './transport'

const KakaoMap = lazy(() => import('./KakaoMap'))

const REVEAL_STEP = 0.12
const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY ?? ''
const FALLBACK_IMAGE = 'images/map-fallback.svg'
const NO_KEY_LABEL = '지도는 카카오 API 키 설정 후 표시됩니다'
const LOADING_LABEL = '지도를 불러오는 중'
const PLACEHOLDER_COORDS_LABEL = '임시 좌표 · 예식장 확정 후 교정'
const TMAP_MISSING = '티맵 앱이 설치되어 있어야 합니다'

const TRANSPORT_ICON: Record<TransportKey, LucideIcon> = {
  subway: TrainFront,
  bus: Bus,
  car: Car,
  parking: ParkingCircle,
  shuttle: BusFront,
}

const navLinkClass =
  'inline-flex h-11 w-full items-center justify-center rounded-full border border-line bg-bg-elevated px-1 ' +
  'text-[15px] font-medium text-ink transition-colors select-none hover:bg-accent-soft/60 active:bg-accent-soft ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

function MapFallback({ label }: { label: string }) {
  return (
    <div className="relative size-full">
      <img src={asset(FALLBACK_IMAGE)} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <p className="rounded-full border border-line bg-bg-elevated/90 px-4 py-2 text-center text-[15px] text-ink">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function Location() {
  const { event, transport } = wedding
  const { venueName, hall, address, addressJibun, coords } = event
  const toast = useToast()
  const [mapFailed, setMapFailed] = useState(false)
  const onMapError = useCallback(() => setMapFailed(true), [])

  const place = useMemo(() => ({ name: venueName, lat: coords.lat, lng: coords.lng }), [venueName, coords.lat, coords.lng])
  const appName = useMemo(() => hostOf(siteUrl()) || window.location.host, [])
  const kakaoHref = kakaoNaviUrl(place)
  const naverHref = naverAppUrl(place, appName)
  const naverWebHref = naverWebUrl(address)
  const tmapHref = tmapUrl(place)
  const entries = transportEntries(transport)

  const openNaver = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    openAppScheme(naverHref, { onFail: () => openWebUrl(naverWebHref) })
  }
  const openTmap = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    openAppScheme(tmapHref, { onFail: () => toast.show(TMAP_MISSING) })
  }

  const showMap = KAKAO_KEY.length > 0 && !mapFailed

  return (
    <Section id="location" eyebrow="LOCATION" title="오시는 길">
      <Reveal className="text-center">
        <p className="font-serif text-[20px] leading-snug text-ink">{venueName}</p>
        <p className="mt-1 text-[15px] text-ink">{hall}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{address}</p>
        {addressJibun && <p className="mt-0.5 text-[14px] leading-relaxed text-ink-muted">(지번) {addressJibun}</p>}
        <div className="mt-4 flex justify-center">
          <CopyButton text={address} label="주소 복사" successMessage="주소가 복사되었습니다" />
        </div>
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-10">
        <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-line bg-accent-soft/30" data-lenis-prevent>
          {showMap ? (
            <MapBoundary fallback={<MapFallback label={NO_KEY_LABEL} />}>
              <Suspense fallback={<MapFallback label={LOADING_LABEL} />}>
                <KakaoMap
                  appkey={KAKAO_KEY}
                  lat={coords.lat}
                  lng={coords.lng}
                  title={venueName}
                  placeholder={<MapFallback label={LOADING_LABEL} />}
                  onError={onMapError}
                />
              </Suspense>
            </MapBoundary>
          ) : (
            <MapFallback label={NO_KEY_LABEL} />
          )}
        </div>
        {coords.placeholder && <p className="mt-3 text-center text-[14px] text-ink-muted">{PLACEHOLDER_COORDS_LABEL}</p>}

        <ul className="mt-4 grid grid-cols-3 gap-2" aria-label="길찾기">
          <li>
            <a href={kakaoHref} target="_blank" rel="noopener noreferrer" className={navLinkClass}>
              카카오내비
            </a>
          </li>
          <li>
            <a href={naverHref} target="_blank" rel="noopener noreferrer" className={navLinkClass} onClick={openNaver}>
              네이버지도
            </a>
          </li>
          <li>
            <a href={tmapHref} target="_blank" rel="noopener noreferrer" className={navLinkClass} onClick={openTmap}>
              티맵
            </a>
          </li>
        </ul>
      </Reveal>

      {entries.length > 0 && (
        <Reveal delay={REVEAL_STEP * 2} className="mt-10">
          <dl className="divide-y divide-line border-y border-line">
            {entries.map(({ key, label, lines }) => {
              const Icon = TRANSPORT_ICON[key]
              return (
                <div key={key} className="flex gap-4 py-5">
                  <dt className="flex w-18 shrink-0 items-center gap-2 self-start text-[15px] font-medium text-ink">
                    <Icon size={18} aria-hidden="true" className="shrink-0 text-accent" />
                    {label}
                  </dt>
                  <dd className="min-w-0 flex-1">
                    {lines.map((line, i) => (
                      <p key={i} className="text-[15px] leading-relaxed text-ink-muted">
                        {line}
                      </p>
                    ))}
                  </dd>
                </div>
              )
            })}
          </dl>
        </Reveal>
      )}
    </Section>
  )
}
