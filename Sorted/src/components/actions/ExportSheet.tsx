import { useState } from 'react'
import type { RouteResult, ScheduledStop, LunchStop } from '@/types/itinerary'
import { useBookingStore } from '@/store/bookingStore'

interface Props {
  result: RouteResult
}

type FieldOption = 'times' | 'travel' | 'duration'
type Layout = 'lines' | 'oneline'

function buildText(
  result: RouteResult,
  fields: Set<FieldOption>,
  layout: Layout,
  date: string,
  adults: number,
  children: number,
): string {
  const dateStr = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  const guestParts = [
    adults > 0 ? `${adults} adult${adults !== 1 ? 's' : ''}` : '',
    children > 0 ? `${children} child${children !== 1 ? 'ren' : ''}` : '',
  ].filter(Boolean)

  const header = [dateStr, guestParts.join(', ')].filter(Boolean).join(' · ')

  const lines: string[] = []
  if (header) lines.push(header)

  let stopNum = 0
  result.stops.forEach((stop) => {
    if ('isLunch' in stop && stop.isLunch) {
      const lunch = stop as LunchStop
      const parts = [`Lunch ${lunch.arrivalTime}–${lunch.departureTime}`]
      if (layout === 'lines') lines.push(parts[0])
      else lines.push(parts[0])
      return
    }

    if (!stop.feasible) {
      stopNum++
      const parts = [`${stopNum}. ${stop.venue.name} — not schedulable`]
      if (layout === 'lines') lines.push(parts[0])
      else lines.push(parts[0])
      return
    }

    const s = stop as ScheduledStop
    stopNum++
    const parts: string[] = [`${stopNum}. ${s.venue.name}`]

    if (fields.has('times')) {
      const entry = s.entryTime ?? s.arrivalTime
      parts.push(`${entry}–${s.departureTime}`)
    }
    if (fields.has('travel') && s.travelFromPrev > 0) {
      parts.push(`${s.travelFromPrev} min travel`)
    }
    if (fields.has('duration')) {
      parts.push(`${s.venue.avgVisitDurationMins} min visit`)
    }
    if (s.lateWarning) {
      parts.push(`⚠ ${s.lateWarning}`)
    }

    if (layout === 'oneline') {
      lines.push(parts.join(' — '))
    } else {
      lines.push(parts[0])
      parts.slice(1).forEach((p) => lines.push(`   ${p}`))
    }
  })

  lines.push(`Tour ends ~${result.endTime}`)

  if (layout === 'oneline') return lines.join(', ')
  return lines.join('\n')
}

export function ExportSheet({ result }: Props) {
  const { date, adults, children } = useBookingStore()
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState<Set<FieldOption>>(new Set(['times', 'travel']))
  const [layout, setLayout] = useState<Layout>('lines')
  const [copied, setCopied] = useState(false)

  function toggleField(f: FieldOption) {
    setFields((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
    setCopied(false)
  }

  const preview = buildText(result, fields, layout, date, adults, children)

  function copy() {
    navigator.clipboard.writeText(preview).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-navy-muted hover:text-navy transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy itinerary
      </button>

      {open && (
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-4">

          {/* Fields to include */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-navy-muted">Include</span>
            <div className="flex flex-wrap gap-1.5">
              {([
                ['times', 'Times'],
                ['travel', 'Travel mins'],
                ['duration', 'Visit duration'],
              ] as [FieldOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleField(key)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                    ${fields.has(key)
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-navy-muted">Format</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => { setLayout('lines'); setCopied(false) }}
                className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors text-left
                  ${layout === 'lines' ? 'bg-navy text-white border-navy' : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300'}`}
              >
                <span className="font-medium block">One stop per line</span>
                <span className="opacity-70">1. Guinness Storehouse{'\n'}   10:00–12:00</span>
              </button>
              <button
                type="button"
                onClick={() => { setLayout('oneline'); setCopied(false) }}
                className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors text-left
                  ${layout === 'oneline' ? 'bg-navy text-white border-navy' : 'bg-white text-navy-muted border-slate-200 hover:border-slate-300'}`}
              >
                <span className="font-medium block">Single line</span>
                <span className="opacity-70">1. Guinness — 10:00, 2. EPIC…</span>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-navy-muted">Preview</span>
            <pre className="text-xs text-navy bg-slate-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap font-sans leading-relaxed border border-slate-100 max-h-36 overflow-y-auto">
              {preview}
            </pre>
          </div>

          {/* Copy button */}
          <button
            type="button"
            onClick={copy}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors
              ${copied ? 'bg-emerald-600 text-white' : 'bg-navy text-white hover:bg-navy/90'}`}
          >
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
        </div>
      )}
    </div>
  )
}
