import { SORT_LABELS, type FoundFilter, type SortKey } from '../lib/sortFilter'

interface Props {
  search: string
  filter: FoundFilter
  sort: SortKey
  onSearch: (v: string) => void
  onFilter: (v: FoundFilter) => void
  onSort: (v: SortKey) => void
}

const field =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-orange-400'

export default function Controls(p: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <input
        className={field}
        placeholder="Search serial # (e.g. 44)"
        inputMode="numeric"
        value={p.search}
        onChange={(e) => p.onSearch(e.target.value)}
      />
      <select
        className={field}
        value={p.filter}
        onChange={(e) => p.onFilter(e.target.value as FoundFilter)}
      >
        <option value="all">Show all</option>
        <option value="found">Found only</option>
        <option value="notfound">Not found only</option>
      </select>
      <select className={field} value={p.sort} onChange={(e) => p.onSort(e.target.value as SortKey)}>
        {Object.entries(SORT_LABELS).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
