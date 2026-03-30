interface Props {
  value: number
  onChange: (pax: number) => void
}

export function PaxInput({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Number of guests</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-navy-muted
                     hover:bg-slate-50 hover:text-navy transition-colors text-sm font-medium"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-semibold text-navy">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(50, value + 1))}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-navy-muted
                     hover:bg-slate-50 hover:text-navy transition-colors text-sm font-medium"
        >
          +
        </button>
      </div>
    </label>
  )
}
