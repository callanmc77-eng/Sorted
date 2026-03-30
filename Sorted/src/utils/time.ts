/** parseTime("09:30") → 570  (minutes from midnight) */
export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** formatTime(570) → "09:30" */
export function formatTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** addMinutes("09:30", 90) → "11:00" */
export function addMinutes(hhmm: string, mins: number): string {
  return formatTime(parseTime(hhmm) + mins)
}
