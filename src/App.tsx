import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import TrackerPage from './pages/TrackerPage'
import CopyPage from './pages/CopyPage'
import NotFoundPage from './pages/NotFoundPage'

// Recharts is heavy; only download it when someone opens /stats.
const StatsPage = lazy(() => import('./pages/StatsPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<TrackerPage />} />
        <Route path="card/:slug/:serial" element={<CopyPage />} />
        <Route path="stats" element={
            <Suspense fallback={<p className="text-zinc-500">Loading stats…</p>}>
              <StatsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
