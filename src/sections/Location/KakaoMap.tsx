import { useEffect, type ReactNode } from 'react'
import { Map as KakaoMapView, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk'

interface KakaoMapProps {
  appkey: string
  lat: number
  lng: number
  /** Venue name, used as the marker tooltip and the map's accessible name */
  title: string
  /** Shown over the map area until the Kakao script has loaded */
  placeholder: ReactNode
  /** Called when the Kakao script fails to load (retries exhausted) */
  onError: () => void
}

const LEVEL = 3

/**
 * Loaded through React.lazy so react-kakao-maps-sdk and the Kakao script stay out of
 * the initial bundle. The SDK's Map waits for the script itself; `loading` only drives
 * the placeholder overlay.
 */
export default function KakaoMap({ appkey, lat, lng, title, placeholder, onError }: KakaoMapProps) {
  const [loading, error] = useKakaoLoader({ appkey })

  useEffect(() => {
    if (error) onError()
  }, [error, onError])

  if (error) return null

  return (
    <>
      <KakaoMapView
        center={{ lat, lng }}
        level={LEVEL}
        draggable={true}
        style={{ width: '100%', height: '100%' }}
        role="region"
        aria-label={`${title} 지도`}
      >
        <MapMarker position={{ lat, lng }} title={title} />
      </KakaoMapView>
      {loading && <div className="absolute inset-0">{placeholder}</div>}
    </>
  )
}
