interface Props {
  value: string
  onChange: (time: string) => void
}

export function StartTimePicker({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Start time</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy
                   focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
      />
    </label>
  )
}
