import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--border-color) bg-(--color-primary) px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:w-auto sm:flex-nowrap sm:pb-0">
          <h1 className="text-3xl">OrdreFlyt</h1>
          <Link to="/" className="">
            Ny Ordre
          </Link>
          <Link
            to="/documents"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Dokumenter
          </Link>
          <Link
            to="/customers"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Kunder
          </Link>
          <Link
            to="/products"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Produkter
          </Link>
          <Link
            to="/settings"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Innstillinger
          </Link>
        </div>
      </nav>
    </header>
  )
}
