import type { City } from '@/types/venue'

interface Props {
  value: string
  onChange: (cityId: string) => void
  cities: City[]
}

export function CitySelector({ value, onChange, cities }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-navy-muted font-medium">City</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy
                   focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy/40"
      >
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  )
}
