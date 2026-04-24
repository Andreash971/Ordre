import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import {
  Archive,
  FilePlusIcon,
  Home,
  IdCard,
  Package,
  Settings,
} from 'lucide-react'
import * as React from 'react'

import { queryKeys } from '#/lib/query-keys'
import { getAllCustomers } from '#/lib/customer-server-fns'
import { getAllProducts } from '#/lib/product-server-fns'
import { getStoredOrders } from '#/lib/order-utils'

const primaryLinks = [
  {
    to: '/',
    label: 'Oversikt',
    icon: <Home className="text-foreground" />,
  },
  {
    to: '/new',
    label: 'Ny Ordre',
    icon: <FilePlusIcon className="text-foreground" />,
  },
] as const

type RegistryLink = {
  to: '/archive' | '/customers' | '/products'
  label: string
  icon: React.ReactNode
  count?: number
}

export default function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  const { data: customers } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => getAllCustomers(),
    staleTime: 60_000,
  })
  const { data: products } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => getAllProducts(),
    staleTime: 60_000,
  })

  const [archiveCount, setArchiveCount] = React.useState<number | null>(null)
  React.useEffect(() => {
    setArchiveCount(getStoredOrders().length)
    const handler = () => setArchiveCount(getStoredOrders().length)
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const registryLinks: RegistryLink[] = [
    {
      to: '/archive',
      label: 'Arkiv',
      icon: <Archive className="text-foreground" />,
      count: archiveCount ?? undefined,
    },
    {
      to: '/customers',
      label: 'Kunder',
      icon: <IdCard className="text-foreground" />,
      count: customers?.length,
    },
    {
      to: '/products',
      label: 'Produkter',
      icon: <Package className="text-foreground" />,
      count: products?.length,
    },
  ]

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <p className="w-48 text-2xl font-semibold group-data-[collapsible=icon]:hidden">
          Blomster i Byhaven
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
          OrdreFlyt
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {primaryLinks.map(({ to, label, icon }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  className="text-base [&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
                >
                  <Link
                    to={to}
                    activeProps={
                      { 'data-active': 'true' } as Record<string, string>
                    }
                    activeOptions={{ exact: true }}
                    onClick={handleNavClick}
                  >
                    {icon}
                    {label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Arkiv og register</SidebarGroupLabel>
          <SidebarMenu>
            {registryLinks.map(({ to, label, icon }) => (
              <SidebarMenuItem key={to}>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  className="text-base [&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
                >
                  <Link
                    to={to}
                    activeProps={
                      { 'data-active': 'true' } as Record<string, string>
                    }
                    onClick={handleNavClick}
                  >
                    {icon}
                    {label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 py-2">
        <SidebarMenuButton
          asChild
          size="lg"
          className="w-auto text-base [&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
        >
          <Link
            to="/settings"
            activeProps={{ 'data-active': 'true' } as Record<string, string>}
            onClick={handleNavClick}
          >
            <Settings className="text-foreground" />
            Innstillinger
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
