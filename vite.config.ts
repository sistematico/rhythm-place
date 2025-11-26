import 'dotenv/config'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const dev = process.env.NODE_ENV !== 'production'

export default defineConfig({
	server: { port: dev ? 3000 : 4060 },
	plugins: [tailwindcss(), tsConfigPaths(), tanstackStart(), nitro(), viteReact()],
	nitro: {}
})
