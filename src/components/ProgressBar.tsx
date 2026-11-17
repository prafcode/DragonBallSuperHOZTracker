interface Props {
  found: number
  total: number
  label?: string
  size?: 'sm' | 'lg'
}

export default function ProgressBar({ found, total, label, size = 'lg' }: Props) {
  const pct = total ? (found / total) * 100 : 0
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-neutral-400">
        <span>{label ?? `${found} / ${total} found`}</span>
        <span className="font-mono">{pct.toFixed(1)}%</span>
      </div>
      <div className={`overflow-hidden rounded-full bg-neutral-800 ${size === 'lg' ? 'h-2' : 'h-1'}`}>
        <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
