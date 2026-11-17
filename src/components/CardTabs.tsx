import { CARDS, PRINT_RUN, foundCount } from '../lib/copies'
import type { CardSlug } from '../types'

interface Props {
  active: CardSlug
  onChange: (slug: CardSlug) => void
}

export default function CardTabs({ active, onChange }: Props) {
  return (
    <div role="tablist" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {CARDS.map((c) => {
        const on = c.slug === active
        const n = foundCount(c.slug)
        return (
          <button
            key={c.slug}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(c.slug)}
            className="rounded-xl border px-3 py-2 text-left transition hover:bg-white/5"
            style={{
              borderColor: on ? c.accent : 'rgba(255,255,255,.1)',
              background: on ? `${c.accent}22` : undefined,
              boxShadow: on ? `0 0 16px ${c.accent}55` : undefined,
            }}
          >
            <div className="font-display text-xl tracking-wide" style={{ color: c.accent }}>
              {c.character}
            </div>
            <div className="text-[11px] text-zinc-400">{c.number}</div>
            <div className="mt-1 h-1 overflow-hidden rounded bg-white/10">
              <div
                className="h-full"
                style={{ width: `${(n / PRINT_RUN) * 100}%`, background: c.accent }}
              />
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-300">
              {n}/{PRINT_RUN}
            </div>
          </button>
        )
      })}
    </div>
  )
}
