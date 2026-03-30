import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (location: string) => void
}

export function StartLocationInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [ready, setReady] = useState(false)

  // Initialise Places Autocomplete once Maps SDK is loaded
  useEffect(() => {
    if (!inputRef.current) return

    const tryInit = () => {
      if (
        typeof google === 'undefined' ||
        !google.maps?.places?.Autocomplete
      ) return false

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current!,
        {
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'ie' },
          fields: ['formatted_address', 'name', 'geometry'],
        },
      )

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace()
        // Prefer the place name (e.g. "The Westbury Hotel") with address appended
        const display = place.name
          ? place.formatted_address
            ? `${place.name}, ${place.formatted_address}`
            : place.name
          : place.formatted_address ?? ''
        onChange(display)
      })

      setReady(true)
      return true
    }

    if (!tryInit()) {
      // Maps not loaded yet — poll until it is
      const interval = setInterval(() => {
        if (tryInit()) clearInterval(interval)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [onChange])

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Starting from</span>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          defaultValue={value}
          placeholder="e.g. The Westbury Hotel"
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy w-full
                     placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-navy/20
                     focus:border-navy/40"
        />
        {ready && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" title="Location suggestions active">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400">Type a hotel, address or landmark — suggestions will appear</p>
    </label>
  )
}
