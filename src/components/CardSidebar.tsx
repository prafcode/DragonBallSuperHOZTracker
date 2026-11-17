import { CARDS, PRINT_RUN, foundCount } from '../lib/copies'
import type { CardSlug } from '../types'

interface Props {
  active: CardSlug
  onChange: (slug: CardSlug) => void
}

/** Card tabs: a vertical list on desktop, a horizontal scroller on phones. */
export default function CardSidebar({ active, onChange }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="Cards"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
    >
      {CARDS.map((c) => {
        const on = c.slug === active
        const n = foundCount(c.slug)
        return (
          <button
            key={c.slug}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.slug)}
            className={`min-w-36 shrink-0 rounded-lg border px-3 py-2.5 text-left transition lg:min-w-0 ${
              on
                ? 'border-white bg-white text-black'
                : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium">{c.character}</span>
              <span className={`font-mono text-xs ${on ? 'text-neutral-600' : 'text-neutral-500'}`}>
                {n}/{PRINT_RUN}
              </span>
            </div>
            <div className={`text-[11px] ${on ? 'text-neutral-600' : 'text-neutral-500'}`}>{c.number}</div>
            <div className={`mt-2 h-0.5 overflow-hidden rounded ${on ? 'bg-neutral-300' : 'bg-neutral-800'}`}>
              <div
                className={`h-full ${on ? 'bg-black' : 'bg-neutral-400'}`}
                style={{ width: `${(n / PRINT_RUN) * 100}%` }}
              />
            </div>
          </button>
        )
      })}
    </nav>
  )
}
