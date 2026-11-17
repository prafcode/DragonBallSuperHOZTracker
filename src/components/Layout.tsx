import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm transition ${
    isActive ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
  }`

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight text-white">HOZ Tracker</span>
            <span className="hidden text-xs text-neutral-500 sm:inline">
              Dragon Ball Super Masters · History of Z · Serialized /100
            </span>
          </Link>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navCls}>
              Binder
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

      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        <p>
          Fan-made tracker. Not affiliated with Bandai or Toei Animation. Dragon Ball © Bird
          Studio/Shueisha, Toei Animation.
        </p>
        <p className="mt-1">
          Know where a copy is? Open an issue on{' '}
          <a
            className="text-neutral-300 underline-offset-2 hover:underline"
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
