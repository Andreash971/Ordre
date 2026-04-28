import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'

import { getRouter } from './router'
import TanStackQueryProvider from './integrations/tanstack-query/root-provider'

import './styles.css'

const router = getRouter()

const rootEl = document.getElementById('root')!
ReactDOM.createRoot(rootEl).render(
  <StrictMode>
    <TanStackQueryProvider>
      <RouterProvider router={router} />
    </TanStackQueryProvider>
  </StrictMode>,
)
