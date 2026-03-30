import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (location: string) => void
  isLoaded: boolean
}

export function StartLocationInput({ value, onChange, isLoaded }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null)
  const [autocompleteReady, setAutocompleteReady] = useState(false)

  useEffect(() => {
    if (!isLoaded || !containerRef.current || elementRef.current) return

    // New Places API (required for keys created after March 2025)
    const el = new google.maps.places.PlaceAutocompleteElement({
      componentRestrictions: { country: 'ie' },
    })

    // Style to match our input
    el.style.width = '100%'

    el.addEventListener('gmp-placeselect', (event: Event) => {
      const e = event as CustomEvent
      const place: google.maps.places.Place = e.detail.place
      place.fetchFields({ fields: ['displayName', 'formattedAddress'] }).then(() => {
        const display = place.displayName
          ? place.formattedAddress
            ? `${place.displayName}, ${place.formattedAddress}`
            : place.displayName
          : place.formattedAddress ?? ''
        onChange(display)
      })
    })

    containerRef.current.appendChild(el)
    elementRef.current = el
    setAutocompleteReady(true)
  }, [isLoaded, onChange])

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Starting from</span>

      {autocompleteReady ? (
        <div ref={containerRef} className="w-full" />
      ) : (
        <div ref={containerRef} className="w-full">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. The Westbury Hotel"
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy w-full
                       placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-navy/20
                       focus:border-navy/40"
          />
        </div>
      )}

      <p className="text-xs text-slate-400">
        {autocompleteReady
          ? 'Type a hotel, address or landmark — suggestions will appear'
          : 'Loading location suggestions…'}
      </p>
    </label>
  )
}
