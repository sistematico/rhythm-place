import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/song')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ message: 'Hello, world!' })
      },
    },
  },
})