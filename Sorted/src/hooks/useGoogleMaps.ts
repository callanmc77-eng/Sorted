import { useState, useEffect } from 'react'

export function useGoogleMaps(): { isLoaded: boolean; error: string | null } {
  const [isLoaded, setIsLoaded] = useState(
    () => typeof window !== 'undefined' && !!(window as { __googleMapsLoaded?: boolean }).__googleMapsLoaded,
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ((window as { __googleMapsLoaded?: boolean }).__googleMapsLoaded) {
      setIsLoaded(true)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API key is not configured. Add VITE_GOOGLE_MAPS_API_KEY to .env.local')
      return
    }

    // Avoid injecting the script twice (React StrictMode double-invoke)
    if (document.getElementById('google-maps-script')) return

    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker,routes&loading=async&callback=__googleMapsReady`
    script.async = true
    script.defer = true

    ;(window as { __googleMapsReady?: () => void }).__googleMapsReady = () => {
      ;(window as { __googleMapsLoaded?: boolean }).__googleMapsLoaded = true
      setIsLoaded(true)
    }

    script.onerror = () =>
      setError('Failed to load Google Maps. Check your API key and internet connection.')

    document.head.appendChild(script)
  }, [])

  return { isLoaded, error }
}
