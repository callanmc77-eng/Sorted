import type { TransportMode } from '@/types/itinerary'

interface Props {
  value: TransportMode
  onChange: (mode: TransportMode) => void
}

export function TransportToggle({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Transport</span>
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        <button
          type="button"
          onClick={() => onChange('DRIVING')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors
            ${value === 'DRIVING'
              ? 'bg-white text-navy shadow-sm border border-slate-200'
              : 'text-navy-muted hover:text-navy'
            }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          Private driver
        </button>
        <button
          type="button"
          onClick={() => onChange('WALKING')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors
            ${value === 'WALKING'
              ? 'bg-white text-navy shadow-sm border border-slate-200'
              : 'text-navy-muted hover:text-navy'
            }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><path d="m9 20 3-7 2 3 2-4M6.5 14h3.5l1-4h4"/>
          </svg>
          Walking
        </button>
      </div>
    </label>
  )
}
