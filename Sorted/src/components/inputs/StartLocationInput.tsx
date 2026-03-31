import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  value: string
  onChange: (location: string) => void
  isLoaded: boolean
}

interface Suggestion {
  label: string
  placeId: string
}

export function StartLocationInput({ value, onChange, isLoaded }: Props) {
  const [inputVal, setInputVal] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep inputVal in sync if parent resets value (e.g. clear)
  useEffect(() => {
    if (value === '') setInputVal('')
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!isLoaded || input.length < 2) {
        setSuggestions([])
        return
      }

      try {
        // Create a new session token on first request
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
        }

        const { suggestions: raw } = await (
          google.maps.places.AutocompleteSuggestion as {
            fetchAutocompleteSuggestions: (req: object) => Promise<{ suggestions: Array<{ placePrediction: { toPlace: () => unknown; text: { text: string }; placeId: string } }> }>
          }
        ).fetchAutocompleteSuggestions({
          input,
          sessionToken: sessionTokenRef.current,
          locationBias: { center: { lat: 53.3454, lng: -6.2672 }, radius: 50000 }, // bias to Dublin
        })

        setSuggestions(
          raw.map((s) => ({
            label: s.placePrediction.text.text,
            placeId: s.placePrediction.placeId,
          })),
        )
        setOpen(true)
      } catch {
        // Silently fail — user can still type a manual address
        setSuggestions([])
      }
    },
    [isLoaded],
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputVal(val)
    // Pass raw text to parent so geocoder can use it if no suggestion chosen
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  function handleSelect(s: Suggestion) {
    setInputVal(s.label)
    onChange(s.label)
    setSuggestions([])
    setOpen(false)
    // Reset session token after selection (billing: one token per session)
    sessionTokenRef.current = null
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      setSuggestions([])
    }
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Starting from</span>
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="e.g. The Westbury Hotel"
          autoComplete="off"
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy w-full
                     placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-navy/20
                     focus:border-navy/40 pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>

        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200
                         rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
                  className="w-full text-left px-3 py-2 text-xs text-navy hover:bg-slate-50 transition-colors truncate"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-slate-400">
        {isLoaded ? 'Type a hotel, address or landmark' : 'Loading location suggestions…'}
      </p>
    </label>
  )
}
