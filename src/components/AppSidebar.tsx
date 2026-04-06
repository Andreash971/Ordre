import { Link } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import { FilePlusIcon } from 'lucide-react'
import { Archive } from 'lucide-react'
import { IdCard } from 'lucide-react'
import { Package } from 'lucide-react'
import { Settings } from 'lucide-react'

const navLinks = [
  {
    to: '/',
    label: 'Ny Ordre',
    icon: <FilePlusIcon className="text-foreground" />,
  },
  {
    to: '/archive',
    label: 'Arkiv',
    icon: <Archive className="text-foreground" />,
  },
  {
    to: '/customers',
    label: 'Kunder',
    icon: <IdCard className="text-foreground" />,
  },
  {
    to: '/products',
    label: 'Produkter',
    icon: <Package className="text-foreground" />,
  },
] as const

export default function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <p className="text-2xl font-semibold group-data-[collapsible=icon]:hidden">
          Blomster i Byhaven
        </p>
        <p className="text-lg group-data-[collapsible=icon]:hidden">Ordre</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navLinks.map(({ to, label, icon }) => (
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
          >
            <Settings className="text-foreground" />
            Innstillinger
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
