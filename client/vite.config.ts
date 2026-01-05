import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const dev = import.meta.env.DEV;

export default defineConfig({
	plugins: [
		// Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
	],
	server: {
		proxy: {
			"/api": {
				target: dev ? "http://localhost:3000" : "https://rhythm.place/api",
				changeOrigin: true,
			},
		},
	},
});
