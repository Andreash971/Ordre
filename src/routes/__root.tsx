import { lazy, Suspense } from 'react'
import {
  createRootRouteWithContext,
  Navigate,
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
import { PAGE_LABELS } from '../lib/navigation'
import { useOnboardingCompleted } from '../lib/store-hooks'

import type { QueryClient } from '@tanstack/react-query'

const DevtoolsPanel = import.meta.env.DEV
  ? lazy(() => import('../components/DevtoolsPanel'))
  : null

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <NotFound />,
})

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const onboardingCompleted = useOnboardingCompleted()

  if (!onboardingCompleted && pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />
  }

  if (pathname === '/onboarding') {
    return (
      <>
        <Outlet />
        {DevtoolsPanel && (
          <Suspense fallback={null}>
            <DevtoolsPanel />
          </Suspense>
        )}
      </>
    )
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="sticky -ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-8"
              />
              <h1>{PAGE_LABELS[pathname] ?? 'Ordre'}</h1>
            </div>
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      {DevtoolsPanel && (
        <Suspense fallback={null}>
          <DevtoolsPanel />
        </Suspense>
      )}
    </>
  )
}
