import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

if (!process.env.DB_FILE_NAME) throw new Error('Missing DB_FILE_NAME env variable')

const client = createClient({ url: process.env.DB_FILE_NAME })
// Quick sanity check to surface misconfiguration early
if (!client || typeof (client as any).execute !== 'function') {
	throw new Error('DB client does not implement execute(). Did you provide a valid libSQL url or client?')
}

export const db = drizzle(client, { schema })