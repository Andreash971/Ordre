import { useEffect, useState } from 'react'
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

import { getStoredSettings } from '@/lib/settings'
import { SETTINGS_CHANGED_EVENT } from '@/lib/store-cache'
import UpdateCard from '@/components/UpdateCard'

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

  const [displayName, setDisplayName] = useState(
    () => getStoredSettings().company.displayName,
  )
  useEffect(() => {
    const handler = () =>
      setDisplayName(getStoredSettings().company.displayName)
    window.addEventListener(SETTINGS_CHANGED_EVENT, handler)
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handler)
  }, [])

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-4 py-3">
        <p className="w-48 text-2xl font-semibold font-heading group-data-[collapsible=icon]:hidden">
          {displayName}
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
                className="group/new text-base bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground data-active:bg-primary data-active:text-primary-foreground [&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
              >
                <Link
                  to="/new"
                  activeProps={{ 'data-active': 'true' }}
                  activeOptions={{ exact: true }}
                  onClick={handleNavClick}
                >
                  <FilePlusIcon className="text-primary-foreground data-active:text-primary-foreground" />
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
                    activeProps={{ 'data-active': 'true' }}
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
        <UpdateCard />
        <SidebarMenuButton
          asChild
          size="lg"
          className="w-auto text-base [&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
        >
          <Link
            to="/settings"
            activeProps={{ 'data-active': 'true' }}
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
