import { useRef, useState, type ReactNode, type PointerEvent } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** Max tilt in degrees. Small tiles use less so the grid doesn't feel jumpy. */
  tilt?: number
}

/** Wraps content in the holographic foil effect defined by `.foil` in index.css. */
export default function FoilCard({ children, className = '', tilt = 10 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width // 0..1
    const y = (e.clientY - r.top) / r.height
    // Write CSS variables directly: no React re-render per pointer move.
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--ry', `${(x - 0.5) * tilt}deg`)
    el.style.setProperty('--rx', `${(0.5 - y) * tilt}deg`)
  }

  const onLeave = () => {
    setActive(false)
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      data-active={active}
      onPointerEnter={() => setActive(true)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`foil overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}
