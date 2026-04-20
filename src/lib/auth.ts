import { betterAuth } from 'better-auth'
import { dash } from '@better-auth/infra'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies(), dash()],
})
