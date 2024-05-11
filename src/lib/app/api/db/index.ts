import { schemaTaxonomy } from './schema/taxonomy'
import { schemaSequences } from './schema/sequences'
import { schemaCollections } from './schema/collections'
import Database from '@tauri-apps/plugin-sql'

export class DB extends Database {}
export const dbPathTaxonomy: string = 'sqlite:db/taxonomy.db'
export const dbPathSequences: string = 'sqlite:db/sequences.db'
export const dbPathCollections: string = 'sqlite:db/collections.db'

export async function initDBTaxonomy() {
  const db: DB = await DB.load(dbPathTaxonomy)
  await db.execute(schemaTaxonomy.text)
  return db
}

export async function initDBSequences() {
  const db: DB = await DB.load(dbPathSequences)
  await db.execute(schemaSequences.text)
  return db
}

export async function initDBCollections() {
  const db: DB = await DB.load(dbPathCollections)
  await db.execute(schemaCollections.text)
  return db
}

export async function vacuum(db: DB) {
  await db.execute('VACUUM;')
}

export async function beginTransaction(db: DB) {
  await db.execute('BEGIN TRANSACTION;')
}

export async function commitTransaction(db: DB) {
  await db.execute('COMMIT TRANSACTION;')
}

export async function rollbackTransaction(db: DB) {
  await db.execute('ROLLBACK TRANSACTION;')
}
