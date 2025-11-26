// routes/api/users.ts
import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../db' // ajuste o caminho para seu db
import { songs } from '../../db/schema' // ajuste o caminho para seu schema
import { sql, eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/song')({
	server: {
		handlers: {
			// GET /api/users - Buscar todos os usuários
			GET: async () => {
				try {
					// const [song] = await db.select().from(songs).where(eq(songs.genre, 'various')).orderBy(sql`RANDOM()`).limit(1)
					const [song] = await db.select().from(songs).orderBy(sql`RANDOM()`).limit(1)

					if (!song) return new Response(JSON.stringify({ song: null, message: 'No song found', success: false }), { status: 404 })

					return new Response(JSON.stringify({ song, message: 'Random song picked', success: true }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          })
				} catch (error) {
					console.error('Erro ao buscar usuários:', error)
					return new Response(JSON.stringify({ message: 'Falha ao buscar música' }), {
						status: 500,
						headers: {
							'Content-Type': 'application/json'
						}
					})
				}
			},

			// POST /api/users - Criar novo usuário
			// POST: async ({ request }) => {
			// 	try {
			// 		const body = await request.json()
			// 		const newUser = await db.insert(users).values(body).returning()

			// 		return new Response(JSON.stringify(newUser[0]), {
			// 			status: 201,
			// 			headers: {
			// 				'Content-Type': 'application/json'
			// 			}
			// 		})
			// 	} catch (error) {
			// 		console.error('Erro ao criar usuário:', error)
			// 		return new Response(JSON.stringify({ error: 'Falha ao criar usuário' }), {
			// 			status: 500,
			// 			headers: {
			// 				'Content-Type': 'application/json'
			// 			}
			// 		})
			// 	}
			// }

		}
	}
})
