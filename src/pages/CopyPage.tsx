import { Link, useParams } from 'react-router-dom'
import { PRINT_RUN, getCard, getSlots, pad, usd } from '../lib/copies'
import { useTitle } from '../lib/useTitle'
import NotFoundPage from './NotFoundPage'

export default function CopyPage() {
  const { slug = '', serial: serialParam = '' } = useParams()
  const card = getCard(slug)
  const serial = Number(serialParam)
  useTitle(card ? `${card.character} #${pad(serial)}/100` : 'Not found')

  if (!card || !Number.isInteger(serial) || serial < 1 || serial > PRINT_RUN) return <NotFoundPage />

  const { copy } = getSlots(card.slug)[serial - 1]
  const sales = [...(copy?.sales ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const grades = [...(copy?.grades ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const prev = serial > 1 ? serial - 1 : PRINT_RUN
  const next = serial < PRINT_RUN ? serial + 1 : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <Link to={`/?card=${card.slug}`} className="text-zinc-400 hover:text-white">
          ← Back to {card.character}
        </Link>
        <div className="flex gap-2">
          <Link className="rounded-md bg-white/5 px-3 py-1 hover:bg-white/10" to={`/card/${card.slug}/${prev}`}>
            ‹ #{pad(prev)}
          </Link>
          <Link className="rounded-md bg-white/5 px-3 py-1 hover:bg-white/10" to={`/card/${card.slug}/${next}`}>
            #{pad(next)} ›
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="space-y-3">
          {copy?.images?.length ? (
            copy.images.map((src) => (
              <img key={src} src={src} alt="" className="w-full rounded-xl border border-white/10" />
            ))
          ) : (
            <div
              className="flex aspect-[63/88] items-center justify-center rounded-xl border bg-black/40"
              style={{ borderColor: `${card.accent}66` }}
            >
              <span className="font-display text-6xl text-white/15">{pad(serial)}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-display text-4xl tracking-wide" style={{ color: card.accent }}>
              {card.character} #{pad(serial)}/100
            </h1>
            <p className="text-sm text-zinc-400">
              {card.name} · {card.number}
            </p>
            <span
              className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-bold uppercase ${
                copy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-zinc-500'
              }`}
            >
              {copy ? 'Found' : 'Not found'}
            </span>
          </div>

          {copy ? (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Found by" value={copy.foundBy} />
                <Info label="Found on" value={copy.foundDate} />
                {copy.source && (
                  <Info
                    label="Source"
                    value={
                      <a href={copy.source} target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">
                        Link ↗
                      </a>
                    }
                  />
                )}
                {copy.notes && <Info label="Notes" value={copy.notes} />}
              </dl>

              <History title="Sales" empty="No recorded sales.">
                {sales.map((s) => (
                  <li key={s.date + s.price} className="flex justify-between gap-2">
                    <span className="font-semibold">{usd(s.price)}</span>
                    <span className="text-zinc-400">{s.grade ?? 'Raw'}</span>
                    <span className="text-zinc-500">
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
                  <li key={g.date + g.company} className="flex justify-between">
                    <span className="font-semibold">
                      {g.company} {g.grade}
                    </span>
                    <span className="text-zinc-500">{g.date}</span>
                  </li>
                ))}
              </History>
            </>
          ) : (
            <p className="text-zinc-400">
              This copy hasn't surfaced yet. If you pulled it, open an issue on GitHub with a photo and
              we'll add it.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white/5 p-3">
      <dt className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  )
}

function History({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-400">{title}</h2>
      {children.length ? (
        <ul className="space-y-1 rounded-lg bg-white/5 p-3 text-sm">{children}</ul>
      ) : (
        <p className="text-sm text-zinc-500">{empty}</p>
      )}
    </section>
  )
}
