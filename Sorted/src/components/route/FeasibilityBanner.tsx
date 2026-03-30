export function FeasibilityBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
      <span className="text-amber-500 mt-0.5 shrink-0 text-base">⚠</span>
      <div>
        <p className="text-sm font-medium text-amber-800">Some attractions can't be visited</p>
        <p className="text-xs text-amber-700 mt-0.5 leading-snug">
          See the reasons below. Try adjusting the start time, removing the flagged
          attraction, or picking an alternative.
        </p>
      </div>
    </div>
  )
}
