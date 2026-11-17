import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CardSidebar from '../components/CardSidebar'
import Controls from '../components/Controls'
import Pocket from '../components/Pocket'
import ProgressBar from '../components/ProgressBar'
import { CARDS, PRINT_RUN, foundCount, getCard, getSlots, lastFind, pad } from '../lib/copies'
import { SORT_LABELS, applyView, type FoundFilter, type SortKey } from '../lib/sortFilter'
import { useTitle } from '../lib/useTitle'

const FILTERS: FoundFilter[] = ['all', 'found', 'notfound']

export default function TrackerPage() {
  useTitle('Tracker')
  // All view state lives in the URL so any view is shareable, e.g. ?card=broly&filter=found
  const [params, setParams] = useSearchParams()
  const card = getCard(params.get('card') ?? '') ?? CARDS[0]
  const filter = (FILTERS as string[]).includes(params.get('filter') ?? '')
    ? (params.get('filter') as FoundFilter)
    : 'all'
  const sort = (params.get('sort') ?? '') in SORT_LABELS ? (params.get('sort') as SortKey) : 'serial-asc'
  const search = params.get('q') ?? ''

  const slots = useMemo(
    () => applyView(getSlots(card.slug), { filter, sort, search }),
    [card.slug, filter, sort, search],
  )

  /** Set or clear URL params (a value equal to the default is removed to keep links short). */
  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const total = foundCount()
  const last = lastFind()

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <ProgressBar
          found={total}
          total={CARDS.length * PRINT_RUN}
          label={`${total} of ${CARDS.length * PRINT_RUN} serialized copies found`}
        />
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
          <CardSidebar active={card.slug} onChange={(s) => update('card', s, CARDS[0].slug)} />
        </aside>

        <section className="min-w-0 space-y-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">{card.name}</h1>
            <p className="text-xs text-neutral-500">
              {card.number} · {foundCount(card.slug)} of {PRINT_RUN} found
            </p>
          </div>

          <Controls
            search={search}
            filter={filter}
            sort={sort}
            onSearch={(v) => update('q', v, '')}
            onFilter={(v) => update('filter', v, 'all')}
            onSort={(v) => update('sort', v, 'serial-asc')}
          />

          {slots.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-500">No copies match.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
              {slots.map((s) => (
                <Pocket key={s.serial} slot={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
