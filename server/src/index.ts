import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import { songRoutes } from './routes'
// import type { ApiResponse } from "shared/dist";

const dev = import.meta.env.DEV
const port = dev ? 3000 : Number(process.env.PORT || 4060)

const app = new Hono()

app.use(cors())

// Rotas da API
app.get('/api', (c) => {
  return c.text('Hello Hono!')
})

// app.get("/api/hello", async (c) => {
// 	const data: ApiResponse = {
// 		message: "Hello BHVR!",
// 		success: true,
// 	};

// 	return c.json(data, { status: 200 });
// });

app.route('/song', songRoutes)

app.use('*', serveStatic({ root: './static' }))

// Fallback para SPA (Single Page Application)
app.get('*', async (c, next) => {
  return serveStatic({ root: './static', path: 'index.html' })(c, next)
})

export default {
  port,
  fetch: app.fetch
}

console.log(`🦫 bhvr server running on port ${port}`)
