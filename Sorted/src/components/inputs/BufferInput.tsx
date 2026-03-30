import { useBookingStore } from '@/store/bookingStore'

const OPTIONS = [0, 10, 15, 20, 30]

export function BufferInput() {
  const { bufferMins, setBufferMins } = useBookingStore()

  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-navy-muted font-medium">Buffer between stops</span>
        {bufferMins > 0 && (
          <button
            type="button"
            onClick={() => setBufferMins(0)}
            className="text-xs text-slate-400 hover:text-navy-muted transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {OPTIONS.map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => setBufferMins(mins)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors
              ${bufferMins === mins
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300 hover:text-navy'
              }`}
          >
            {mins === 0 ? 'None' : `${mins} min`}
          </button>
        ))}
        {/* Custom value if user typed something not in presets */}
        {!OPTIONS.includes(bufferMins) && (
          <span className="text-xs px-2.5 py-1 rounded-full border bg-navy text-white border-navy">
            {bufferMins} min
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400">Added after each stop for comfort, restroom breaks, etc.</p>
    </label>
  )
}
