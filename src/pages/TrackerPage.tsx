import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CardTabs from '../components/CardTabs'
import Controls from '../components/Controls'
import ProgressBar from '../components/ProgressBar'
import SlotTile from '../components/SlotTile'
import { CARDS, PRINT_RUN, foundCount, getCard, getSlots, lastFind, pad } from '../lib/copies'
import { SORT_LABELS, applyView, type FoundFilter, type SortKey } from '../lib/sortFilter'
import { useTitle } from '../lib/useTitle'
import type { CardSlug } from '../types'

const FILTERS: FoundFilter[] = ['all', 'found', 'notfound']

export default function TrackerPage() {
  useTitle('Tracker')
  // All view state lives in the URL so any view (e.g. ?card=broly&filter=found) is shareable.
  const [params, setParams] = useSearchParams()
  const card = getCard(params.get('card') ?? '') ?? CARDS[0]
  const filter = (FILTERS as string[]).includes(params.get('filter') ?? '')
    ? (params.get('filter') as FoundFilter)
    : 'all'
  const sort = (params.get('sort') ?? '') in SORT_LABELS ? (params.get('sort') as SortKey) : 'serial-asc'
  const search = params.get('q') ?? ''

  const update = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const slots = useMemo(
    () => applyView(getSlots(card.slug), { filter, sort, search }),
    [card.slug, filter, sort, search],
  )

  const total = foundCount()
  const last = lastFind()

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <ProgressBar found={total} total={CARDS.length * PRINT_RUN} />
        {last && (
          <p className="text-center text-sm text-zinc-400">
            Last find:{' '}
            <Link
              to={`/card/${last.card.slug}/${last.serial}`}
              className="font-semibold hover:underline"
              style={{ color: last.card.accent }}
            >
              {last.card.character} #{pad(last.serial)}
            </Link>{' '}
            by {last.copy!.foundBy} on {last.copy!.foundDate}
          </p>
        )}
      </section>

      <CardTabs active={card.slug} onChange={(s: CardSlug) => update('card', s, CARDS[0].slug)} />

      <section className="rounded-2xl border border-white/10 bg-white/[.02] p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-3xl tracking-wide" style={{ color: card.accent }}>
              {card.name}
            </h1>
            <p className="text-xs text-zinc-400">{card.number} · Serial numbered /100</p>
          </div>
          <div className="w-full sm:w-64">
            <ProgressBar
              found={foundCount(card.slug)}
              total={PRINT_RUN}
              accent={card.accent}
              size="sm"
            />
          </div>
        </div>

        <Controls
          search={search}
          filter={filter}
          sort={sort}
          onSearch={(v) => update('q', v, '')}
          onFilter={(v) => update('filter', v, 'all')}
          onSort={(v) => update('sort', v, 'serial-asc')}
        />

        {slots.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
            {slots.map((s) => (
              <SlotTile key={s.serial} slot={s} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-zinc-500">No copies match.</p>
        )}
      </section>
    </div>
  )
}
