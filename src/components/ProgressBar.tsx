interface Props {
  found: number
  total: number
  accent?: string
  label?: string
  size?: 'sm' | 'lg'
}

export default function ProgressBar({ found, total, accent = '#f97316', label, size = 'lg' }: Props) {
  const pct = total ? (found / total) * 100 : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <span>{label ?? `${found} / ${total} found`}</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div className={`overflow-hidden rounded-full bg-white/10 ${size === 'lg' ? 'h-4' : 'h-2'}`}>
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%`, background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
      </div>
    </div>
  )
}
