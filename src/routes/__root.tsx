import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar'
import { Separator } from '../components/ui/separator'
import NotFound from '../components/NotFound'

import AppSidebar from '../components/AppSidebar'

import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <NotFound />,
})

const pageLabels: Record<string, string> = {
  '/': 'Oversikt',
  '/new': 'Ny Ordre',
  '/archive': 'Arkiv',
  '/customers': 'Kunder',
  '/products': 'Varer',
  '/settings': 'Innstillinger',
}

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <>
      <div className="titlebar" />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 m-3 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="sticky -ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-8"
              />
              <h1>{pageLabels[pathname] ?? 'Ordre'}</h1>
            </div>
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
          { name: 'Tanstack Query', render: <ReactQueryDevtoolsPanel /> },
          formDevtoolsPlugin(),
        ]}
      />
    </>
  )
}
