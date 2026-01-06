import { RadioProvider } from '../contexts/RadioContext'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <RadioProvider>
      <Outlet />
      <TanStackRouterDevtools />
    </RadioProvider>
  )
})
