import { useState } from 'react'
import { useBookingStore } from '@/store/bookingStore'

const PRESETS = [0, 10, 15, 20, 30]

export function BufferInput() {
  const { bufferMins, setBufferMins } = useBookingStore()
  const [showCustom, setShowCustom] = useState(!PRESETS.includes(bufferMins) && bufferMins > 0)
  const [customVal, setCustomVal] = useState(
    !PRESETS.includes(bufferMins) && bufferMins > 0 ? String(bufferMins) : ''
  )

  function handlePreset(mins: number) {
    setShowCustom(false)
    setBufferMins(mins)
  }

  function handleCustomToggle() {
    setShowCustom(true)
    setBufferMins(0)
    setCustomVal('')
  }

  function handleCustomChange(val: string) {
    setCustomVal(val)
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 0 && n <= 120) setBufferMins(n)
  }

  const isCustomActive = showCustom || (!PRESETS.includes(bufferMins) && bufferMins > 0)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-navy-muted font-medium">Buffer between stops</span>
        {bufferMins > 0 && (
          <button
            type="button"
            onClick={() => { setBufferMins(0); setShowCustom(false); setCustomVal('') }}
            className="text-xs text-slate-400 hover:text-navy-muted transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap items-center">
        {PRESETS.map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => handlePreset(mins)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors
              ${bufferMins === mins && !isCustomActive
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300 hover:text-navy'
              }`}
          >
            {mins === 0 ? 'None' : `${mins} min`}
          </button>
        ))}

        {!isCustomActive ? (
          <button
            type="button"
            onClick={handleCustomToggle}
            className="text-xs px-2.5 py-1 rounded-full border bg-white text-navy-muted
                       border-slate-200 hover:border-slate-300 hover:text-navy transition-colors"
          >
            Custom…
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="120"
              value={customVal}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="min"
              autoFocus
              className="w-16 border border-navy rounded-full px-2 py-0.5 text-xs text-navy
                         text-center focus:outline-none focus:ring-2 focus:ring-navy/20 bg-white"
            />
            <span className="text-xs text-navy-muted">min</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">Added after each stop — restroom breaks, transfers, etc.</p>
    </div>
  )
}
