import { Link } from 'react-router-dom'
import { useTitle } from '../lib/useTitle'

export default function NotFoundPage() {
  useTitle('Page not found')
  return (
    <div className="py-24 text-center">
      <p className="font-display text-6xl text-orange-400">404</p>
      <p className="mt-2 text-zinc-400">This page went to Other World.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-orange-500 px-4 py-2 font-semibold text-black">
        Back to the tracker
      </Link>
    </div>
  )
}
