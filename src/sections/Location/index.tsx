import { Bus, BusFront, Car, ParkingCircle, TrainFront, type LucideIcon } from 'lucide-react'
import { useInView } from 'motion/react'
import { lazy, Suspense, useCallback, useMemo, useRef, useState, type MouseEvent } from 'react'
import CopyButton from '@/components/CopyButton'
import Reveal from '@/components/Reveal'
import Section from '@/components/Section'
import { useToast } from '@/components/toast-context'
import { wedding } from '@/config/wedding'
import { Bleed, LightBloom } from '@/effects'
import { asset } from '@/lib/env'
import { REVEAL_STEP } from '@/lib/motion'
import { kakaoKey, siteUrl } from '@/lib/kakao'
import MapBoundary from './MapBoundary'
import {
  androidIntentUrl,
  hostOf,
  isAndroidUserAgent,
  kakaoNaviUrl,
  NAVER_MAP_PACKAGE,
  naverAppUrl,
  naverWebUrl,
  TMAP_PACKAGE,
  TMAP_STORE_URL,
  tmapUrl,
} from './links'
import { openAppScheme } from '@/lib/openApp'
import { transportEntries, type TransportKey } from './transport'

const KakaoMap = lazy(() => import('./KakaoMap'))

const FALLBACK_IMAGE = 'images/map-fallback.svg'
const NO_KEY_LABEL = '지도 준비 중입니다'
const MAP_FAILED_LABEL = '지도를 불러오지 못했습니다'
const LOADING_LABEL = '지도를 불러오는 중'
const PLACEHOLDER_COORDS_LABEL = '지도 위치는 예식장 확정 후 정확히 표시됩니다'
const TMAP_MISSING = '티맵 앱이 설치되어 있어야 합니다'
const NAVER_MISSING = '네이버지도 앱이 설치되어 있어야 합니다'
/** iOS can keep the page visible while it asks "Open in app?", so wait longer than the default */
const APP_TIMEOUT_MS = 2500
/** Loads the map chunk, SDK and tiles shortly before the box scrolls into view */
const MAP_PRELOAD_MARGIN = '300px 0px'
const IS_ANDROID = typeof navigator !== 'undefined' && isAndroidUserAgent(navigator.userAgent)

const TRANSPORT_ICON: Record<TransportKey, LucideIcon> = {
  subway: TrainFront,
  bus: Bus,
  car: Car,
  parking: ParkingCircle,
  shuttle: BusFront,
}

const navLinkClass =
  'pressable inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-bg-elevated px-1 py-2 leading-tight ' +
  'text-[0.9375rem] tracking-[0.02em] text-ink select-none hover:bg-mint active:bg-mint ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
/** App-scheme links: an iOS long-press "Open in New Tab" would open a dead scheme URL */
const appLinkClass = `${navLinkClass} [-webkit-touch-callout:none]`

function MapFallback({ label }: { label: string }) {
  return (
    <div className="relative size-full">
      <img src={asset(FALLBACK_IMAGE)} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <p className="rounded-full border border-line bg-white/85 px-4 py-2 text-center text-[0.9375rem] text-ink">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function Location() {
  const { event, location } = wedding
  const { transport } = location
  const { venueName, hall, address, addressJibun, coords } = event
  const toast = useToast()
  const [mapFailed, setMapFailed] = useState(false)
  const onMapError = useCallback(() => setMapFailed(true), [])
  const mapBoxRef = useRef<HTMLDivElement>(null)
  const mapNear = useInView(mapBoxRef, { once: true, margin: MAP_PRELOAD_MARGIN })

  const place = { name: venueName, lat: coords.lat, lng: coords.lng }
  const appName = useMemo(() => hostOf(siteUrl()) || window.location.host, [])
  const kakaoHref = kakaoNaviUrl(place)
  const naverHref = naverAppUrl(place, appName)
  const naverWebHref = naverWebUrl(address)
  const tmapHref = tmapUrl(place)
  const entries = transportEntries(transport)

  // On Android the OS picks app or fallback from the intent URL, and elsewhere a timer guesses
  const openNaver = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    openAppScheme(naverHref, { timeoutMs: APP_TIMEOUT_MS, onFail: () => toast.show(NAVER_MISSING) })
  }
  const openTmap = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    openAppScheme(tmapHref, { timeoutMs: APP_TIMEOUT_MS, onFail: () => toast.show(TMAP_MISSING) })
  }
  const naverLinkProps = IS_ANDROID
    ? { href: androidIntentUrl(naverHref, NAVER_MAP_PACKAGE, naverWebHref) }
    : { href: naverHref, onClick: openNaver }
  const tmapLinkProps = IS_ANDROID
    ? { href: androidIntentUrl(tmapHref, TMAP_PACKAGE, TMAP_STORE_URL) }
    : { href: tmapHref, onClick: openTmap }

  const hasKey = kakaoKey.length > 0
  const showMap = hasKey && !mapFailed

  return (
    <Section
      id="location"
      eyebrow={location.eyebrow}
      title={location.title}
      top="sm"
      bottom="sm"
      backdrop={
        // Dimmed to 0.65 so even two overlapping blob peaks keep text-ink-muted at 4.5:1 under the address lines
        <Bleed top="-8rem" bottom="0" mask="y" fade="12rem">
          <LightBloom palette={['butter', 'mint']} intensity="soft" className="opacity-65" />
        </Bleed>
      }
    >
      <Reveal className="text-center">
        <p className="font-serif text-[1.25rem] leading-snug text-ink">{venueName}</p>
        {hall.trim() && <p className="mt-1 text-[0.9375rem] text-ink">{hall}</p>}
        <p className="mt-4 text-[0.9375rem] leading-[1.8] text-ink-muted">{address}</p>
        {addressJibun && <p className="mt-0.5 text-[0.9375rem] leading-[1.8] text-ink-muted">(지번) {addressJibun}</p>}
        <div className="mt-4 flex justify-center">
          <CopyButton text={address} label="주소 복사" successMessage="주소가 복사되었습니다" />
        </div>
      </Reveal>

      <Reveal delay={REVEAL_STEP} className="mt-10">
        <div
          ref={mapBoxRef}
          className="relative aspect-4/3 overflow-hidden rounded-2xl border-6 border-white bg-mint shadow-(--shadow-soft)"
          data-lenis-prevent
        >
          {showMap && mapNear ? (
            <MapBoundary fallback={<MapFallback label={MAP_FAILED_LABEL} />}>
              <Suspense fallback={<MapFallback label={LOADING_LABEL} />}>
                <KakaoMap
                  appkey={kakaoKey}
                  lat={coords.lat}
                  lng={coords.lng}
                  title={venueName}
                  placeholder={<MapFallback label={LOADING_LABEL} />}
                  onError={onMapError}
                />
              </Suspense>
            </MapBoundary>
          ) : (
            <MapFallback label={showMap ? LOADING_LABEL : hasKey ? MAP_FAILED_LABEL : NO_KEY_LABEL} />
          )}
        </div>
        {coords.placeholder && <p className="mt-3 text-center text-[0.9375rem] text-ink-muted">{PLACEHOLDER_COORDS_LABEL}</p>}

        <ul className="mt-4 grid grid-cols-3 gap-2" aria-label="길찾기">
          <li>
            <a href={kakaoHref} target="_blank" rel="noopener noreferrer" className={navLinkClass}>
              카카오내비
            </a>
          </li>
          <li>
            <a {...naverLinkProps} className={appLinkClass}>
              네이버지도
            </a>
          </li>
          <li>
            <a {...tmapLinkProps} className={appLinkClass}>
              티맵
            </a>
          </li>
        </ul>
        {!IS_ANDROID && (
          <p className="mt-3 text-center">
            <a
              href={naverWebHref}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex min-h-11 items-center px-2 text-[0.9375rem] text-ink-muted underline underline-offset-4 active:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              네이버지도 웹에서 보기
            </a>
          </p>
        )}
      </Reveal>

      {entries.length > 0 && (
        <Reveal delay={REVEAL_STEP * 2} className="mt-10">
          <dl className="divide-y divide-line rounded-2xl border border-line bg-bg-elevated px-5">
            {entries.map(({ key, label, lines }) => {
              const Icon = TRANSPORT_ICON[key]
              return (
                <div key={key} className="py-5">
                  <dt className="flex items-center gap-2.5 font-serif text-[1rem] text-ink">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-mint text-accent">
                      <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    {label}
                  </dt>
                  <dd className="mt-1.5 min-w-0 pl-[2.875rem]">
                    {lines.map((line, i) => (
                      <p key={i} className="text-[0.9375rem] leading-[1.8] text-ink-muted">
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
