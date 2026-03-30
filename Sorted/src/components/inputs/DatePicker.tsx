interface Props {
  value: string
  onChange: (date: string) => void
}

export function DatePicker({ value, onChange }: Props) {
  // Default min to today
  const today = new Date().toISOString().split('T')[0]

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Date</span>
      <input
        type="date"
        value={value}
        min={today}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy
                   focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
      />
    </label>
  )
}
