import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { getRouter } from './router'
import TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import { hydrateStoreCache } from './lib/store-cache'
import { applyTheme, getStoredTheme, initTheme } from './lib/theme'

import './styles.css'

initTheme()
await hydrateStoreCache()
applyTheme(getStoredTheme())

const router = getRouter()

const rootEl = document.getElementById('root')!
ReactDOM.createRoot(rootEl).render(
  <StrictMode>
    <TanStackQueryProvider>
      <RouterProvider router={router} />
    </TanStackQueryProvider>
  </StrictMode>,
)
