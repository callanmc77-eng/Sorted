export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
      <p className="text-xs text-navy-muted">Calculating optimal route…</p>
    </div>
  )
}
