import { useBookingStore } from '@/store/bookingStore'
import type { TourDuration } from '@/types/itinerary'

const OPTIONS: { value: TourDuration; label: string }[] = [
  { value: 'half', label: 'Half day' },
  { value: 'full', label: 'Full day' },
  { value: 'custom', label: 'Custom' },
]

export function TourDurationPicker() {
  const { tourDuration, endTime, setTourDuration, setEndTime } = useBookingStore()

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Tour length</span>

      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTourDuration(opt.value)}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors
              ${tourDuration === opt.value
                ? 'bg-white text-navy shadow-sm border border-slate-200'
                : 'text-navy-muted hover:text-navy'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Show end-time hint for half/full, or editable input for custom */}
      {tourDuration === 'half' && (
        <p className="text-xs text-slate-400">Ends by 13:00</p>
      )}
      {tourDuration === 'full' && (
        <p className="text-xs text-slate-400">Ends by 18:00</p>
      )}
      {tourDuration === 'custom' && (
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-navy-muted">End by</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-navy flex-1
                       focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
          />
        </div>
      )}
    </div>
  )
}
