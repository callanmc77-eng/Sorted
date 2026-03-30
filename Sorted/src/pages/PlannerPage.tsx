import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { useRouteBuilder } from '@/hooks/useRouteBuilder'
import { useBookingStore } from '@/store/bookingStore'
import { useAdminStore } from '@/store/adminStore'
import { InputPanel } from '@/components/inputs/InputPanel'
import { AttractionGrid } from '@/components/attractions/AttractionGrid'
import { RoutePanel } from '@/components/route/RoutePanel'
import { LoadingSpinner } from '@/components/route/LoadingSpinner'
import { OpenBookingsButton } from '@/components/actions/OpenBookingsButton'

export function PlannerPage() {
  const { isLoaded, error: mapsError } = useGoogleMaps()
  const { buildRoute } = useRouteBuilder()
  const { isCalculating, routeResult, error, selectedVenueIds, date, startLocation } =
    useBookingStore()
  const { venues } = useAdminStore()

  const cityId = useBookingStore((s) => s.cityId)
  const cityVenues = venues.filter((v) => v.cityId === cityId)

  const canCalculate =
    isLoaded && !isCalculating && selectedVenueIds.length > 0 && !!date && !!startLocation

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-surface">
      {/* ── Left column: inputs ─────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 border-r border-slate-200 bg-surface-card overflow-y-auto p-6">
        <InputPanel />
      </aside>

      {/* ── Centre: attraction selection + optimise button ───────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <AttractionGrid venues={cityVenues} />

        <div className="mt-auto pt-4 border-t border-slate-100">
          {mapsError && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700">{mapsError}</p>
            </div>
          )}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
          <button
            type="button"
            onClick={buildRoute}
            disabled={!canCalculate}
            className="w-full py-3 px-6 bg-navy text-white rounded-xl font-semibold text-sm
                       hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isCalculating ? 'Calculating…' : 'Optimise Route'}
          </button>
          {!isLoaded && !mapsError && (
            <p className="text-xs text-navy-muted text-center mt-2">Loading Maps…</p>
          )}
        </div>
      </main>

      {/* ── Right column: itinerary + booking links ──────────────────────────── */}
      <aside className="w-96 shrink-0 border-l border-slate-200 bg-surface-card overflow-y-auto p-6 flex flex-col gap-5">
        {isCalculating && <LoadingSpinner />}

        {!isCalculating && routeResult && (
          <>
            <RoutePanel result={routeResult} />
            <div className="border-t border-slate-100 pt-4">
              <OpenBookingsButton result={routeResult} />
            </div>
          </>
        )}

        {!isCalculating && !routeResult && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
            <svg className="w-8 h-8 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            <p className="text-sm text-navy-muted font-medium">No route yet</p>
            <p className="text-xs text-slate-400 max-w-[200px]">
              Select attractions, fill in trip details, then click Optimise Route.
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}
