import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, useSearchParams } from 'react-router-dom'
import CardSidebar from '../components/CardSidebar'
import Controls, { type ViewMode } from '../components/Controls'
import Pocket from '../components/Pocket'
import ProgressBar from '../components/ProgressBar'
import { CARDS, PRINT_RUN, foundCount, getCard, getSlots, lastFind, pad } from '../lib/copies'
import { SORT_LABELS, applyView, type FoundFilter, type SortKey } from '../lib/sortFilter'
import { useTitle } from '../lib/useTitle'

const FILTERS: FoundFilter[] = ['all', 'found', 'notfound']
const POCKETS = 9 // a standard 9-pocket binder page

export default function TrackerPage() {
  useTitle('Binder')
  // All view state lives in the URL so any view is shareable, e.g. ?card=broly&page=3
  const [params, setParams] = useSearchParams()
  const card = getCard(params.get('card') ?? '') ?? CARDS[0]
  const filter = (FILTERS as string[]).includes(params.get('filter') ?? '')
    ? (params.get('filter') as FoundFilter)
    : 'all'
  const sort = (params.get('sort') ?? '') in SORT_LABELS ? (params.get('sort') as SortKey) : 'serial-asc'
  const view: ViewMode = params.get('view') === 'grid' ? 'grid' : 'binder'
  const search = params.get('q') ?? ''

  const slots = useMemo(
    () => applyView(getSlots(card.slug), { filter, sort, search }),
    [card.slug, filter, sort, search],
  )

  const pageCount = Math.max(1, Math.ceil(slots.length / POCKETS))
  const page = Math.min(pageCount, Math.max(1, Number(params.get('page')) || 1))
  const pageSlots = view === 'grid' ? slots : slots.slice((page - 1) * POCKETS, page * POCKETS)

  // Which way the page flip slides: 1 = forward, -1 = back.
  const [direction, setDirection] = useState<1 | -1>(1)

  /** Update URL params; anything that changes the list sends you back to page 1. */
  const update = (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (!keepPage) next.delete('page')
    setParams(next, { replace: true })
  }
  const goTo = (p: number) => {
    setDirection(p >= page ? 1 : -1)
    update({ page: p === 1 ? null : String(p) }, true)
  }

  const total = foundCount()
  const last = lastFind()

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <ProgressBar found={total} total={CARDS.length * PRINT_RUN} label={`${total} of ${CARDS.length * PRINT_RUN} serialized copies found`} />
        {last && (
          <p className="text-xs text-neutral-500">
            Latest find:{' '}
            <Link to={`/card/${last.card.slug}/${last.serial}`} className="text-neutral-200 hover:underline">
              {last.card.character} #{pad(last.serial)}
            </Link>{' '}
            by {last.copy!.foundBy}, {last.copy!.foundDate}
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <CardSidebar active={card.slug} onChange={(s) => update({ card: s === CARDS[0].slug ? null : s })} />
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">{card.name}</h1>
              <p className="text-xs text-neutral-500">
                {card.number} · {foundCount(card.slug)} of {PRINT_RUN} found
              </p>
            </div>
          </div>

          <Controls
            search={search}
            filter={filter}
            sort={sort}
            view={view}
            onSearch={(v) => update({ q: v })}
            onFilter={(v) => update({ filter: v === 'all' ? null : v })}
            onSort={(v) => update({ sort: v === 'serial-asc' ? null : v })}
            onView={(v) => update({ view: v === 'binder' ? null : v })}
          />

          {slots.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-500">No copies match.</p>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8 xl:grid-cols-10">
              {pageSlots.map((s) => (
                <Pocket key={s.serial} slot={s} />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 sm:p-5">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={`${card.slug}-${page}-${filter}-${sort}-${search}`}
                    custom={direction}
                    initial={{ opacity: 0, x: 40 * direction }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 * direction }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="mx-auto grid max-w-md grid-cols-3 gap-3 sm:gap-4"
                  >
                    {pageSlots.map((s) => (
                      <Pocket key={s.serial} slot={s} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="rounded-md border border-neutral-800 px-3 py-1.5 text-neutral-300 transition hover:border-neutral-500 disabled:opacity-30"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1" aria-label="Pages">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goTo(p)}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                      className={`h-1.5 rounded-full transition-all ${
                        p === page ? 'w-5 bg-white' : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === pageCount}
                  className="rounded-md border border-neutral-800 px-3 py-1.5 text-neutral-300 transition hover:border-neutral-500 disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
              <p className="text-center text-xs text-neutral-600">
                Page {page} of {pageCount}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
