import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CARDS, PRINT_RUN, getAllFound, pad, usd } from '../lib/copies'
import {
  allSales,
  filterSales,
  gradingBreakdown,
  lastSoldFor,
  type Condition,
  type SaleRow,
} from '../lib/sales'
import { useTitle } from '../lib/useTitle'

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'raw', label: 'Raw' },
  { value: 'graded', label: 'Graded' },
]

export default function StatsPage() {
  useTitle('Stats')
  const [params, setParams] = useSearchParams()
  const condition = (CONDITIONS.map((c) => c.value) as string[]).includes(params.get('sales') ?? '')
    ? (params.get('sales') as Condition)
    : 'all'
  const setCondition = (c: Condition) => {
    const next = new URLSearchParams(params)
    if (c === 'all') next.delete('sales')
    else next.set('sales', c)
    setParams(next, { replace: true })
  }

  const found = getAllFound()
  const sales = allSales()
  const shown = filterSales(sales, condition)
  const lastRaw = sales.find((r) => !r.company)
  const lastGraded = sales.find((r) => r.company)
  const volume = sales.reduce((a, r) => a + r.sale.price, 0)
  const { companies, raw, graded } = gradingBreakdown()
  const maxCompany = Math.max(1, ...companies.map((c) => c.copies))

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold tracking-tight text-white">Stats</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Copies found" value={`${found.length} / ${CARDS.length * PRINT_RUN}`} sub={`${raw} raw · ${graded} graded`} />
        <Tile label="Recorded sales" value={String(sales.length)} sub={`${usd(volume)} total volume`} />
        <Tile label="Last raw sale" value={lastRaw ? usd(lastRaw.sale.price) : '—'} sub={lastRaw ? saleCaption(lastRaw) : 'No raw sales yet'} />
        <Tile label="Last graded sale" value={lastGraded ? usd(lastGraded.sale.price) : '—'} sub={lastGraded ? saleCaption(lastGraded) : 'No graded sales yet'} />
      </div>

      <Panel title="Last sold by card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-neutral-500">
              <tr>
                <th className="pb-2 font-normal">Card</th>
                <th className="pb-2 font-normal">Last raw</th>
                <th className="pb-2 font-normal">Last graded</th>
                <th className="pb-2 font-normal">Highest</th>
                <th className="pb-2 text-right font-normal">Sales</th>
              </tr>
            </thead>
            <tbody>
              {CARDS.map((c) => {
                const s = lastSoldFor(c.slug, sales)
                return (
                  <tr key={c.slug} className="border-t border-neutral-800 align-top">
                    <td className="py-2.5 pr-3">
                      <Link to={`/?card=${c.slug}`} className="font-medium text-white hover:underline">{c.character}</Link>
                      <div className="text-xs text-neutral-500">{c.number}</div>
                    </td>
                    <td className="py-2.5 pr-3"><SaleCell row={s.raw} /></td>
                    <td className="py-2.5 pr-3"><SaleCell row={s.graded} showGrade /></td>
                    <td className="py-2.5 pr-3"><SaleCell row={s.top} showGrade /></td>
                    <td className="py-2.5 text-right font-mono text-neutral-400">{s.count}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel
          title="Recent sales"
          action={
            <div className="flex rounded-md border border-neutral-800 p-0.5 text-xs" role="group" aria-label="Condition">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCondition(c.value)}
                  aria-pressed={condition === c.value}
                  className={`rounded px-2.5 py-1 transition ${
                    condition === c.value ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          }
        >
          <SalesChart rows={shown} />
          {shown.length ? (
            <ul className="mt-4 divide-y divide-neutral-800 text-sm">
              {shown.slice(0, 25).map((r) => (
                <li key={`${r.slot.card.slug}-${r.slot.serial}-${r.sale.date}-${r.sale.price}`} className="grid grid-cols-[88px_minmax(0,1fr)_auto_auto] items-center gap-3 py-2">
                  <span className="font-mono text-xs text-neutral-500">{r.sale.date}</span>
                  <Link to={`/card/${r.slot.card.slug}/${r.slot.serial}`} className="truncate text-neutral-200 hover:underline">
                    {r.slot.card.character} #{pad(r.slot.serial)}
                  </Link>
                  <ConditionBadge row={r} />
                  <span className="text-right font-mono text-white">
                    {r.sale.url ? (
                      <a href={r.sale.url} target="_blank" rel="noreferrer" className="hover:underline">{usd(r.sale.price)} ↗</a>
                    ) : (
                      usd(r.sale.price)
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-500">No {condition === 'all' ? '' : condition} sales recorded yet.</p>
          )}
        </Panel>

        <Panel title="Grading breakdown">
          <p className="mb-4 text-xs text-neutral-500">
            {graded} of {found.length} found copies are slabbed · {raw} raw
          </p>
          <div className="space-y-4">
            {companies.map((c) => (
              <div key={c.company}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-white">{c.company}</span>
                  <span className="font-mono text-xs text-neutral-400">
                    {c.copies} {c.copies === 1 ? 'copy' : 'copies'}
                    {graded ? ` · ${Math.round((c.copies / graded) * 100)}%` : ''}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full rounded-full bg-white" style={{ width: `${(c.copies / maxCompany) * 100}%` }} />
                </div>
                {c.grades.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.grades.map(([grade, n]) => (
                      <span key={grade} className="rounded border border-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-neutral-300">
                        {grade} <span className="text-neutral-500">×{n}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

const saleCaption = (r: SaleRow) =>
  `${r.slot.card.character} #${pad(r.slot.serial)}${r.sale.grade ? ` · ${r.sale.grade}` : ''} · ${r.sale.date}`

function SaleCell({ row, showGrade = false }: { row?: SaleRow; showGrade?: boolean }) {
  if (!row) return <span className="text-neutral-600">—</span>
  return (
    <div>
      <div className="font-mono text-white">{usd(row.sale.price)}</div>
      <div className="text-xs text-neutral-500">
        <Link to={`/card/${row.slot.card.slug}/${row.slot.serial}`} className="hover:underline">#{pad(row.slot.serial)}</Link>
        {showGrade && ` · ${row.sale.grade ?? 'Raw'}`} · {row.sale.date}
      </div>
    </div>
  )
}

function ConditionBadge({ row }: { row: SaleRow }) {
  return row.company ? (
    <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-black">{row.sale.grade}</span>
  ) : (
    <span className="rounded border border-neutral-700 px-1.5 py-0.5 text-[11px] text-neutral-400">Raw</span>
  )
}

/** Price vs. date: graded sales as white dots, raw sales as grey dots. */
function SalesChart({ rows }: { rows: SaleRow[] }) {
  if (rows.length < 2) return null
  const point = (r: SaleRow) => ({
    x: Date.parse(r.sale.date),
    y: r.sale.price,
    label: `${r.slot.card.character} #${pad(r.slot.serial)} · ${r.sale.grade ?? 'Raw'}`,
  })
  const rawPts = rows.filter((r) => !r.company).map(point)
  const gradedPts = rows.filter((r) => r.company).map(point)
  // Short date ranges get day-level labels ("Aug 4"), otherwise month + year ("Aug 25").
  const times = [...rawPts, ...gradedPts].map((p) => p.x)
  const shortRange = Math.max(...times) - Math.min(...times) < 120 * 86_400_000
  const fmtDate = (t: number) =>
    new Date(t).toLocaleDateString(
      'en-US',
      shortRange ? { month: 'short', day: 'numeric', timeZone: 'UTC' } : { month: 'short', year: '2-digit', timeZone: 'UTC' },
    )

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#262626" />
          <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} tickFormatter={fmtDate} tick={{ fill: '#737373', fontSize: 11 }} stroke="#404040" />
          <YAxis dataKey="y" type="number" tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} tick={{ fill: '#737373', fontSize: 11 }} stroke="#404040" width={44} />
          <Tooltip
            cursor={{ stroke: '#404040' }}
            content={({ payload }) => {
              const p = payload?.[0]?.payload as ReturnType<typeof point> | undefined
              if (!p) return null
              return (
                <div className="rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs">
                  <div className="text-white">{usd(p.y)}</div>
                  <div className="text-neutral-400">{p.label}</div>
                  <div className="text-neutral-500">{new Date(p.x).toISOString().slice(0, 10)}</div>
                </div>
              )
            }}
          />
          <Scatter name="Raw" data={rawPts} fill="#737373" />
          <Scatter name="Graded" data={gradedPts} fill="#ffffff" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 font-mono text-2xl font-medium text-white">{value}</div>
      <div className="mt-0.5 truncate text-xs text-neutral-400">{sub}</div>
    </div>
  )
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-800 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
