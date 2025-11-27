import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { Link } from '@tanstack/react-router'

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    defaultNotFoundComponent: () => {
      return (
        <div>
          <p>Not found!</p>
          <Link to="/">Go home</Link>
        </div>
      )
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}
