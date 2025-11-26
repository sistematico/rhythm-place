// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import MainLayout from '../components/MainLayout'
import appCss from '../styles.css?url'
import { AudioProvider } from '../contexts/AudioContext'

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8'
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1'
			},
			{
				title: 'Rhythm Place'
			}
		],
		opengraph: {
			title: 'Rhythm Place',
			description: 'Where Every Beat Finds You',
			url: 'https://rhythm.place',
			siteName: 'Rhythm Place',
			images: [
				{
					url: 'https://rhythm.place/images/ogp.png',
					width: 256,
					height: 256,
					alt: 'Rhythm Place'
				}
			],
			locale: 'en_US',
			type: 'website'
		},
		links: [
			{ rel: 'icon', href: '/images/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
			{ rel: 'stylesheet', href: appCss }
		]
	}),
	component: RootComponent
})

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	)
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="pt-BR" suppressHydrationWarning={true}>
			<head>
				<HeadContent />
			</head>
			<body>
				<AudioProvider>
					<MainLayout>
						{children}
					</MainLayout>
				</AudioProvider>
				<Scripts />
			</body>
		</html>
	)
}