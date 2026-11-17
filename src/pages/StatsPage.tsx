import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CARDS, PRINT_RUN, foundCount, getAllFound, latestGrade, latestSale, pad, usd } from '../lib/copies'
import { useTitle } from '../lib/useTitle'
import type { Slot } from '../types'

const PRICE_BUCKETS: [string, number][] = [
  ['< $2.5k', 2500],
  ['$2.5k–5k', 5000],
  ['$5k–10k', 10000],
  ['$10k–20k', 20000],
  ['$20k+', Infinity],
]

const median = (xs: number[]) => {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const countBy = <T,>(xs: T[], key: (x: T) => string) =>
  Object.entries(
    xs.reduce<Record<string, number>>((acc, x) => {
      const k = key(x)
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {}),
  ).map(([name, value]) => ({ name, value }))

export default function StatsPage() {
  useTitle('Stats')
  const found = getAllFound()
  const priced = found.filter((s) => latestSale(s.copy))
  const prices = priced.map((s) => latestSale(s.copy)!.price)
  const graded = found.filter((s) => latestGrade(s.copy))
  const gradeNums = graded.map((s) => Number(latestGrade(s.copy)!.grade)).filter((n) => !Number.isNaN(n))

  const perCard = CARDS.map((c) => {
    const cardPrices = priced.filter((s) => s.card.slug === c.slug).map((s) => latestSale(s.copy)!.price)
    return {
      name: c.character,
      accent: c.accent,
      found: foundCount(c.slug),
      median: median(cardPrices),
      top: cardPrices.length ? Math.max(...cardPrices) : 0,
    }
  })

  const priceDist = PRICE_BUCKETS.map(([name, max], i) => ({
    name,
    value: prices.filter((p) => p < max && p >= (i ? PRICE_BUCKETS[i - 1][1] : 0)).length,
  }))
  const companies = countBy(graded, (s) => latestGrade(s.copy)!.company.toUpperCase())
  const timeline = countBy(
    [...found].sort((a, b) => a.copy!.foundDate.localeCompare(b.copy!.foundDate)),
    (s) => s.copy!.foundDate.slice(0, 7),
  )
  const finders = countBy(found, (s) => s.copy!.foundBy)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
  const recent = [...found].sort((a, b) => b.copy!.foundDate.localeCompare(a.copy!.foundDate)).slice(0, 10)
  const highest = [...priced]
    .sort((a, b) => latestSale(b.copy)!.price - latestSale(a.copy)!.price)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight text-white">Statistics</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Cards found" value={`${found.length}/${CARDS.length * PRINT_RUN}`}
          sub={`${((found.length / (CARDS.length * PRINT_RUN)) * 100).toFixed(1)}% complete`} />
        <Tile label="Total value" value={usd(prices.reduce((a, b) => a + b, 0))} sub="Latest sale of each copy" />
        <Tile label="Median sale" value={usd(median(prices))} sub={`${prices.length} copies with sales`} />
        <Tile label="Graded" value={String(graded.length)}
          sub={gradeNums.length ? `Avg grade ${(gradeNums.reduce((a, b) => a + b, 0) / gradeNums.length).toFixed(1)}` : '—'} />
      </div>

      <Panel title="Card by card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-neutral-500">
              <tr><th className="py-1">Card</th><th>Found</th><th>Median sale</th><th>Top sale</th></tr>
            </thead>
            <tbody>
              {perCard.map((c) => (
                <tr key={c.name} className="border-t border-neutral-800">
                  <td className="py-2 font-medium text-white">{c.name}</td>
                  <td>{c.found}/{PRINT_RUN}</td>
                  <td>{c.median ? usd(c.median) : '—'}</td>
                  <td>{c.top ? usd(c.top) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Chart data={perCard.map((c) => ({ name: c.name, value: c.found }))} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Price distribution"><Chart data={priceDist} /></Panel>
        <Panel title="Grading services"><Chart data={companies} /></Panel>
        <Panel title="Discoveries by month"><Chart data={timeline} /></Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Top finders">
          <List items={finders.map((f) => ({ key: f.name, left: f.name, right: `${f.value} card${f.value > 1 ? 's' : ''}` }))} />
        </Panel>
        <Panel title="Recent finds">
          <List items={recent.map((s) => slotRow(s, s.copy!.foundDate))} />
        </Panel>
        <Panel title="Highest sales">
          <List items={highest.map((s) => slotRow(s, usd(latestSale(s.copy)!.price)))} />
        </Panel>
      </div>
    </div>
  )
}

const slotRow = (s: Slot, right: string) => ({
  key: s.card.slug + s.serial,
  left: (
    <Link to={`/card/${s.card.slug}/${s.serial}`} className="text-neutral-200 hover:underline">
      {s.card.character} #{pad(s.serial)}
    </Link>
  ),
  right,
})

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 font-mono text-2xl font-medium text-white">{value}</div>
      <div className="text-xs text-neutral-400">{sub}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <h2 className="mb-3 text-sm font-bold text-neutral-400">{title}</h2>
      {children}
    </section>
  )
}

function Chart({ data, colors }: { data: { name: string; value: number }[]; colors?: string[] }) {
  if (!data.length) return <p className="text-sm text-neutral-500">No data yet.</p>
  return (
    <div className="mt-2 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 8 }}>
          <CartesianGrid stroke="#ffffff10" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: '#ffffff08' }}
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={colors?.[i] ?? '#e5e5e5'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function List({ items }: { items: { key: string; left: React.ReactNode; right: string }[] }) {
  if (!items.length) return <p className="text-sm text-neutral-500">No data yet.</p>
  return (
    <ol className="space-y-1 text-sm">
      {items.map((it, i) => (
        <li key={it.key} className="flex justify-between gap-2">
          <span className="truncate"><span className="text-neutral-500">{i + 1}.</span> {it.left}</span>
          <span className="shrink-0 text-neutral-400">{it.right}</span>
        </li>
      ))}
    </ol>
  )
}
