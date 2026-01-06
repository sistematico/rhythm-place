import 'dotenv/config'
import { db } from './index'
import { songs } from './schema'
import { readdir } from 'node:fs/promises'
import { parse, join } from 'node:path'

const entries = await readdir(process.env.MUSIC_PATH!, { recursive: true })

const files = entries
  .filter((entry) => {
    const ext = parse(entry).ext.toLowerCase()
    return ext === '.mp3'
  })
  .map((entry) => ({
    path: join(process.env.MUSIC_PATH!, entry) // Cria o caminho absoluto
  }))

// Insere no banco em transações
await db.transaction(async (tx) => {
  for (let i = 0; i < files.length; i += 1000) {
    const chunk = files.slice(i, i + 1000)
    console.log(`Inserting records ${i} to ${i + chunk.length}...`)
    await tx.insert(songs).values(chunk).onConflictDoNothing()
  }
})

console.log(`Found ${files.length} MP3 files out of ${entries.length} total entries.`)
