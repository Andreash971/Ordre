import { Link } from '@tanstack/react-router'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import ThemeToggle from './ThemeToggle'
import { Settings } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Ny Ordre' },
  { to: '/documents', label: 'Dokumenter' },
  { to: '/customers', label: 'Kunder' },
  { to: '/products', label: 'Produkter' },
] as const

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b --color-border --color-background px-4 backdrop-blur-lg">
      <div className="page-wrap flex items-center justify-between gap-x-4 py-3 sm:py-4">
        <div className="flex items-center gap-x-4">
          <h1 className="text-3xl font-semibold --color-foreground">Ordre</h1>
        </div>

        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-x-1">
            {navLinks.map(({ to, label }) => (
              <NavigationMenuItem key={to}>
                <NavigationMenuLink asChild active={false} className="">
                  <Link
                    to={to}
                    activeProps={
                      { 'data-active': 'true' } as Record<string, string>
                    }
                  >
                    {label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-x-1">
          <ThemeToggle />
          <Link
            to="/settings"
            activeProps={{ 'data-active': 'true' } as Record<string, string>}
            className="inline-flex size-8 items-center justify-center rounded-md text-primary-foreground transition-all hover:bg-white/20 data-[active=true]:bg-white/30"
          >
            <Settings className="size-5 text-foreground" />
          </Link>
        </div>
      </div>
    </header>
  )
}
