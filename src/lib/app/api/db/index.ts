import { schemaTaxonomy } from './schema/taxonomy'
import { schemaSequences } from './schema/sequences'
import { schemaCollections } from './schema/collections'
import Database from '@tauri-apps/plugin-sql'

export const dbPathTaxonomy: string = 'sqlite:db/taxonomy.db'
export const dbPathSequences: string = 'sqlite:db/sequences.db'
export const dbPathCollections: string = 'sqlite:db/collections.db'

export async function initDBTaxonomy() {
  const db: Database = await Database.load(dbPathTaxonomy)
  await db.execute(schemaTaxonomy.text)
  await db.close()
}

export async function initDBSequences() {
  const db: Database = await Database.load(dbPathSequences)
  await db.execute(schemaSequences.text)
  await db.close()
}

export async function initDBCollections() {
  const db: Database = await Database.load(dbPathCollections)
  await db.execute(schemaCollections.text)
  await db.close()
}

export async function vacuum(db: Database) {
  console.log('vacuum begin')
  await db.execute('VACUUM;')
  console.log('vacuum done')
}

export async function beginTransaction(db: Database) {
  console.log('beginTransaction begin')
  await db.execute('BEGIN TRANSACTION;')
  console.log('beginTransaction done')
}

export async function commitTransaction(db: Database) {
  console.log('commitTransaction begin')
  await db.execute('COMMIT TRANSACTION;')
  console.log('commitTransaction done')
}

export async function rollbackTransaction(db: Database) {
  console.log('rollbackTransaction begin')
  await db.execute('ROLLBACK TRANSACTION;')
  console.log('rollbackTransaction done')
}
