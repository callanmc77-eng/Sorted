import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (location: string) => void
  isLoaded: boolean
}

// Tell TypeScript about the custom element
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'gmp-placeautocomplete': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<HTMLElement>
        'component-restrictions'?: string
      }
    }
  }
}

export function StartLocationInput({ value, onChange, isLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [autocompleteReady, setAutocompleteReady] = useState(false)

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    // SearchBox works for all key types including new ones
    const searchBox = new google.maps.places.SearchBox(inputRef.current)

    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces()
      if (!places || places.length === 0) return
      const place = places[0]
      const display = place.name
        ? place.formatted_address
          ? `${place.name}, ${place.formatted_address}`
          : place.name
        : place.formatted_address ?? ''
      onChange(display)
    })

    setAutocompleteReady(true)
  }, [isLoaded, onChange])

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Starting from</span>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. The Westbury Hotel"
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy w-full
                     placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-navy/20
                     focus:border-navy/40 pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
          {autocompleteReady ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
            </svg>
          )}
        </span>
      </div>
      <p className="text-xs text-slate-400">
        {autocompleteReady
          ? 'Type a hotel, address or landmark — suggestions will appear'
          : 'Loading location suggestions…'}
      </p>
    </label>
  )
}
