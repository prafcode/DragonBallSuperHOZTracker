import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm font-semibold transition ${
    isActive ? 'bg-orange-500 text-black' : 'text-zinc-300 hover:bg-white/10'
  }`

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b12]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-3xl tracking-wide text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,.6)]">
              HOZ Tracker
            </span>
            <span className="hidden text-xs text-zinc-400 sm:inline">
              DBS Masters · History of Z · Serialized /100
            </span>
          </Link>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navCls}>
              Tracker
            </NavLink>
            <NavLink to="/stats" className={navCls}>
              Stats
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-zinc-500">
        <p>
          Fan-made tracker. Not affiliated with Bandai or Toei Animation. Dragon Ball © Bird
          Studio/Shueisha, Toei Animation.
        </p>
        <p className="mt-1">
          Know where a copy is? Open an issue or PR on{' '}
          <a
            className="text-orange-400 hover:underline"
            href="https://github.com/prafcode/DragonBallSuperHOZTracker"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
