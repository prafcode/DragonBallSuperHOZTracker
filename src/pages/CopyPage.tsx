import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import FoilCard from '../components/FoilCard'
import { CardFace } from '../components/Pocket'
import { PRINT_RUN, getCard, getSlots, pad, usd } from '../lib/copies'
import { useTitle } from '../lib/useTitle'
import type { CardInfo } from '../types'
import NotFoundPage from './NotFoundPage'

export default function CopyPage() {
  const { slug = '', serial: serialParam = '' } = useParams()
  const card = getCard(slug)
  const serial = Number(serialParam)

  if (!card || !Number.isInteger(serial) || serial < 1 || serial > PRINT_RUN) return <NotFoundPage />
  // The key gives each copy fresh gallery state when you click ‹ / ›.
  return <CopyDetail key={`${card.slug}-${serial}`} card={card} serial={serial} />
}

function CopyDetail({ card, serial }: { card: CardInfo; serial: number }) {
  useTitle(`${card.character} #${pad(serial)}/100`)
  const [photo, setPhoto] = useState(0)
  const [viewer, setViewer] = useState(false)

  // Close the full-size viewer with Escape.
  useEffect(() => {
    if (!viewer) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setViewer(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewer])

  const slot = getSlots(card.slug)[serial - 1]
  const { copy } = slot
  const images = copy?.images ?? []
  const current = images[photo]
  const sales = [...(copy?.sales ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const grades = [...(copy?.grades ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const prev = serial > 1 ? serial - 1 : PRINT_RUN
  const next = serial < PRINT_RUN ? serial + 1 : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <Link to={`/?card=${card.slug}`} className="text-neutral-400 hover:text-white">
          ← Back to tracker
        </Link>
        <div className="flex gap-2">
          <Link className="rounded-md border border-neutral-800 px-3 py-1 font-mono text-neutral-300 hover:border-neutral-500" to={`/card/${card.slug}/${prev}`}>
            ‹ {pad(prev)}
          </Link>
          <Link className="rounded-md border border-neutral-800 px-3 py-1 font-mono text-neutral-300 hover:border-neutral-500" to={`/card/${card.slug}/${next}`}>
            {pad(next)} ›
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,340px)_1fr]">
        <div className="space-y-3">
          {copy ? (
            <button
              onClick={() => current && setViewer(true)}
              className={`block w-full ${current ? 'cursor-zoom-in' : 'cursor-default'}`}
              aria-label={current ? 'Open full-size photo' : undefined}
            >
              <FoilCard tilt={14} className="aspect-[63/88] rounded-xl border border-neutral-700">
                {current ? (
                  <img src={current} alt={`${card.character} #${pad(serial)}/100, photo ${photo + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <CardFace slot={slot} large />
                )}
              </FoilCard>
            </button>
          ) : (
            <div className="flex aspect-[63/88] items-center justify-center rounded-xl border border-dashed border-neutral-800">
              <span className="font-mono text-5xl text-neutral-800">{pad(serial)}</span>
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setPhoto(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`h-20 w-14 shrink-0 overflow-hidden rounded-md border transition ${
                    i === photo ? 'border-white' : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs text-neutral-500">
              {card.name} · {card.number}
            </p>
            <h1 className="mt-1 font-mono text-3xl font-medium text-white">
              {pad(serial)}
              <span className="text-neutral-600">/100</span>
            </h1>
            <span
              className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs ${
                copy ? 'border-white bg-white text-black' : 'border-neutral-700 text-neutral-500'
              }`}
            >
              {copy ? 'Found' : 'Missing'}
            </span>
          </div>

          {copy ? (
            <>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-neutral-800 bg-neutral-800 text-sm">
                <Info label="Found by" value={copy.foundBy} />
                <Info label="Found on" value={copy.foundDate} />
                <Info
                  label="Source"
                  value={
                    copy.source ? (
                      <a href={copy.source} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">
                        View source ↗
                      </a>
                    ) : (
                      '—'
                    )
                  }
                />
                <Info label="Photos" value={String(images.length)} />
                {copy.notes && <Info label="Notes" value={copy.notes} wide />}
              </dl>

              <History title="Sales" empty="No recorded sales.">
                {sales.map((s) => (
                  <li key={s.date + s.price} className="grid grid-cols-3 gap-2 px-3 py-2">
                    <span className="font-medium text-white">{usd(s.price)}</span>
                    <span className="text-neutral-400">{s.grade ?? 'Raw'}</span>
                    <span className="text-right text-neutral-500">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">
                          {s.date} ↗
                        </a>
                      ) : (
                        s.date
                      )}
                    </span>
                  </li>
                ))}
              </History>

              <History title="Grading" empty="Not graded yet.">
                {grades.map((g) => (
                  <li key={g.date + g.company} className="flex justify-between px-3 py-2">
                    <span className="font-medium text-white">
                      {g.company} {g.grade}
                    </span>
                    <span className="text-neutral-500">{g.date}</span>
                  </li>
                ))}
              </History>
            </>
          ) : (
            <p className="text-sm text-neutral-400">
              This copy hasn't surfaced yet. If you pulled it, open an issue on GitHub with a photo and it'll be added.
            </p>
          )}
        </div>
      </div>

      {viewer && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full-size photo"
          onClick={() => setViewer(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4"
        >
          <img src={current} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
          <span className="absolute right-4 top-4 text-sm text-neutral-400">Esc to close</span>
        </div>
      )}
    </div>
  )
}

function Info({ label, value, wide = false }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={`bg-neutral-950 p-3 ${wide ? 'col-span-2' : ''}`}>
      <dt className="text-[11px] text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-neutral-200">{value}</dd>
    </div>
  )
}

function History({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium text-neutral-400">{title}</h2>
      {children.length ? (
        <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800 text-sm">{children}</ul>
      ) : (
        <p className="text-sm text-neutral-600">{empty}</p>
      )}
    </section>
  )
}
