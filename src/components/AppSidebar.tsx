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
  useSidebar,
} from '@/components/ui/sidebar'

import { FilePlusIcon, Archive, IdCard, Package, Settings } from 'lucide-react'

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
  const { isMobile, setOpenMobile } = useSidebar()
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <p className="w-48 text-2xl font-semibold group-data-[collapsible=icon]:hidden">
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
