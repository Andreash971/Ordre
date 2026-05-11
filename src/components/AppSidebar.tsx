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

import {
  Archive,
  FilePlusIcon,
  Home,
  IdCard,
  Package,
  Settings,
} from 'lucide-react'

const Links = [
  {
    to: '/',
    label: 'Oversikt',
    icon: <Home className="text-foreground" />,
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
    label: 'Varer',
    icon: <Package className="text-foreground" />,
  },
] as const

export default function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <p className="w-48 text-2xl font-semibold font-sans ironstone:font-heading group-data-[collapsible=icon]:hidden">
          Blomster i Byhaven
        </p>
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
          Ordre
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                className="group/new text-base hover:bg-accent hover:text-accent-foreground [&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
              >
                <Link
                  to="/new"
                  activeProps={
                    { 'data-active': 'true' } as Record<string, string>
                  }
                  activeOptions={{ exact: true }}
                  onClick={handleNavClick}
                >
                  <FilePlusIcon className="text-foreground group-hover/new:text-accent-foreground" />
                  Ny ordre
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {Links.map(({ to, label, icon }) => (
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
