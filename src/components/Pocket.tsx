import { Link } from 'react-router-dom'
import { latestGrade, latestSale, pad, usd } from '../lib/copies'
import type { Slot } from '../types'
import FoilCard from './FoilCard'

/** Front of a found card: the copy's first photo, or a plain placeholder. */
export function CardFace({ slot, large = false }: { slot: Slot; large?: boolean }) {
  const img = slot.copy?.images?.[0]
  if (img) {
    return (
      <img
        src={img}
        alt={`${slot.card.character} ${pad(slot.serial)}/100`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    )
  }
  return (
    <div className="flex h-full w-full flex-col justify-between bg-neutral-900 p-3">
      <span className={`text-neutral-500 ${large ? 'text-sm' : 'text-[10px]'}`}>{slot.card.number}</span>
      <div>
        <div className={`font-mono font-medium text-white ${large ? 'text-4xl' : 'text-lg'}`}>
          {pad(slot.serial)}
          <span className="text-neutral-500">/100</span>
        </div>
        <div className={`text-neutral-400 ${large ? 'text-sm' : 'text-[10px]'}`}>{slot.card.character}</div>
      </div>
    </div>
  )
}

export default function Pocket({ slot }: { slot: Slot }) {
  const { card, serial, copy } = slot
  const sale = latestSale(copy)
  const grade = latestGrade(copy)

  return (
    <Link to={`/card/${card.slug}/${serial}`} className="group block" aria-label={`${card.character} #${pad(serial)}`}>
      {copy ? (
        <FoilCard tilt={8} className="aspect-[63/88] rounded-lg border border-neutral-700">
          <CardFace slot={slot} />
          {grade && (
            <span className="absolute right-1.5 top-1.5 z-10 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {grade.company} {grade.grade}
            </span>
          )}
        </FoilCard>
      ) : (
        <div className="flex aspect-[63/88] items-center justify-center rounded-lg border border-dashed border-neutral-800 transition group-hover:border-neutral-600">
          <span className="font-mono text-sm text-neutral-700 group-hover:text-neutral-500">{pad(serial)}</span>
        </div>
      )}
      <div className="mt-1.5 flex items-baseline justify-between gap-1 px-0.5 text-[11px]">
        <span className={`font-mono ${copy ? 'text-white' : 'text-neutral-600'}`}>#{pad(serial)}</span>
        <span className="truncate text-neutral-500">
          {copy ? (sale ? usd(sale.price) : copy.foundBy) : 'Missing'}
        </span>
      </div>
    </Link>
  )
}
