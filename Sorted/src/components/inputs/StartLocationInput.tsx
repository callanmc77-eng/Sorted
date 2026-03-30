interface Props {
  value: string
  onChange: (location: string) => void
}

export function StartLocationInput({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">Starting from</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. The Shelbourne Hotel, Dublin"
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy
                   placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-navy/20
                   focus:border-navy/40"
      />
      <p className="text-xs text-slate-400">Enter a hotel name, address, or landmark</p>
    </label>
  )
}
