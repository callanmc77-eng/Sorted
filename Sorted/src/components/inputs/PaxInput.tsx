import { useBookingStore } from '@/store/bookingStore'

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-navy">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-navy-muted
                     hover:bg-slate-50 hover:text-navy transition-colors text-sm font-medium"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold text-navy">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(50, value + 1))}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-navy-muted
                     hover:bg-slate-50 hover:text-navy transition-colors text-sm font-medium"
        >
          +
        </button>
      </div>
    </div>
  )
}

export function PaxInput() {
  const { adults, children, setAdults, setChildren } = useBookingStore()
  const total = adults + children

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-navy-muted font-medium">Guests</span>
        {total > 0 && (
          <span className="text-xs text-navy-muted">{total} total</span>
        )}
      </div>
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex flex-col gap-2">
        <Counter label="Adults" value={adults} onChange={setAdults} />
        <div className="border-t border-slate-100" />
        <Counter label="Children" value={children} onChange={setChildren} />
      </div>
    </div>
  )
}
