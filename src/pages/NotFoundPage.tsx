import { Link } from 'react-router-dom'
import { useTitle } from '../lib/useTitle'

export default function NotFoundPage() {
  useTitle('Page not found')
  return (
    <div className="py-24 text-center">
      <p className="font-mono text-5xl text-white">404</p>
      <p className="mt-2 text-sm text-neutral-400">This page went to Other World.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-black">
        Back to the binder
      </Link>
    </div>
  )
}
