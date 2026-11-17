import { SORT_LABELS, type FoundFilter, type SortKey } from '../lib/sortFilter'

export type ViewMode = 'binder' | 'grid'

interface Props {
  search: string
  filter: FoundFilter
  sort: SortKey
  view: ViewMode
  onSearch: (v: string) => void
  onFilter: (v: FoundFilter) => void
  onSort: (v: SortKey) => void
  onView: (v: ViewMode) => void
}

const field =
  'h-9 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-200 outline-none transition focus:border-neutral-400'

export default function Controls(p: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        className={`${field} min-w-0 flex-1 basis-40`}
        placeholder="Serial, e.g. 44"
        inputMode="numeric"
        value={p.search}
        onChange={(e) => p.onSearch(e.target.value)}
        aria-label="Search serial number"
      />
      <select
        className={field}
        value={p.filter}
        onChange={(e) => p.onFilter(e.target.value as FoundFilter)}
        aria-label="Filter"
      >
        <option value="all">All copies</option>
        <option value="found">Found</option>
        <option value="notfound">Missing</option>
      </select>
      <select
        className={field}
        value={p.sort}
        onChange={(e) => p.onSort(e.target.value as SortKey)}
        aria-label="Sort"
      >
        {Object.entries(SORT_LABELS).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
      <div className="flex rounded-md border border-neutral-800 p-0.5" role="group" aria-label="View">
        {(['binder', 'grid'] as const).map((v) => (
          <button
            key={v}
            onClick={() => p.onView(v)}
            aria-pressed={p.view === v}
            className={`rounded px-3 text-sm capitalize transition ${
              p.view === v ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {v === 'binder' ? 'Binder' : 'All 100'}
          </button>
        ))}
      </div>
    </div>
  )
}
