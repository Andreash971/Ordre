import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'

const routeId = '/api/auth/$' as const
export const Route = createFileRoute(routeId)({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
})
