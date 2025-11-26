import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// Em produção, as variáveis de ambiente podem não estar disponíveis
// então usamos um valor padrão ou verificamos se existe
const dbUrl = process.env.DB_FILE_NAME || 'file:drizzle/rhythm.db'

const client = createClient({
	url: dbUrl
})

export const db = drizzle(client, { schema })