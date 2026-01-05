import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig(({ command, mode }) => ({
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
				target: command === "serve" ? "http://localhost:3000" : "https://rhythm.place/api",
				changeOrigin: true,
			},
		},
	},
}));
