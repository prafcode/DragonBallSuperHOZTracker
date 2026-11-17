import { Link } from 'react-router-dom'
import { latestGrade, latestSale, pad, usd } from '../lib/copies'
import type { Slot } from '../types'

export default function SlotTile({ slot }: { slot: Slot }) {
  const { card, serial, copy } = slot
  const sale = latestSale(copy)
  const grade = latestGrade(copy)
  const img = copy?.images?.[0]

  return (
    <Link
      to={`/card/${card.slug}/${serial}`}
      className={`group flex flex-col rounded-xl border p-2 transition hover:-translate-y-0.5 ${
        copy ? '' : 'opacity-50 grayscale hover:opacity-80'
      }`}
      style={{
        borderColor: copy ? card.accent : 'rgba(255,255,255,.08)',
        boxShadow: copy ? `0 0 14px ${card.accent}44` : undefined,
        background: copy ? `${card.accent}12` : 'rgba(255,255,255,.02)',
      }}
    >
      <div className="relative flex aspect-[63/88] items-center justify-center overflow-hidden rounded-lg bg-black/40">
        {img ? (
          <img
            src={img}
            alt={`${card.character} ${pad(serial)}/100`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-3xl text-white/15">{pad(serial)}</span>
        )}
        {grade && (
          <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold">
            {grade.company} {grade.grade}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className="font-display text-lg tracking-wide"
          style={{ color: copy ? card.accent : undefined }}
        >
          #{pad(serial)}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
            copy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-zinc-500'
          }`}
        >
          {copy ? 'Found' : 'Not found'}
        </span>
      </div>
      {copy && (
        <div className="mt-1 space-y-0.5 text-[11px] text-zinc-400">
          <div className="truncate">by {copy.foundBy}</div>
          {sale && (
            <div className="font-semibold text-zinc-200">
              {usd(sale.price)} <span className="font-normal text-zinc-500">{sale.date}</span>
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
