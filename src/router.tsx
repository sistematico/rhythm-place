import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import NotFound from './components/NotFound'

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultNotFoundComponent: () => {
			return <NotFound />
		}
	})

	return router
}
