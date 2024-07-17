import Database from '@tauri-apps/plugin-sql'
import { BaseDirectory, mkdir } from '@tauri-apps/plugin-fs'

import { schemaTaxonomy } from './schema/taxonomy'
import { schemaSeqRecs } from './schema/seqrecs'
import { schemaSequences } from './schema/sequences'
import { schemaCollections } from './schema/collections'

export class DB extends Database {}

export const dbPathTaxonomy: string = 'sqlite:db/taxonomy.db'
export const dbPathSeqRecs: string = 'sqlite:db/seqrecs.db'
export const dbPathSeqRecsUser: string = 'sqlite:db/seqrecs-user.db'
export const dbPathSequences: string = 'sqlite:db/sequences.db'
export const dbPathSequencesUser: string = 'sqlite:db/sequences-user.db'
export const dbPathCollections: string = 'sqlite:db/collections.db'

async function prepareDBDir() {
  await mkdir('db', { baseDir: BaseDirectory.AppConfig, recursive: true })
}

export async function initDBTaxonomy() {
  // console.log('initDBTaxonomy: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathTaxonomy)
  await beginTransaction(db)
  await db.execute(schemaTaxonomy.text)
  await commitTransaction(db)
  // console.log('initDBTaxonomy: DONE')
  return db
}

export async function initDBSeqRecs() {
  // console.log('initDBSeqRecs: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSeqRecs)
  await beginTransaction(db)
  await db.execute(schemaSeqRecs.text)
  await commitTransaction(db)
  // console.log('initDBSeqRecs: DONE')
  return db
}

export async function initDBSeqRecsUser() {
  // console.log('initDBSeqRecs: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSeqRecsUser)
  await beginTransaction(db)
  await db.execute(schemaSeqRecs.text)
  await commitTransaction(db)
  // console.log('initDBSeqRecs: DONE')
  return db
}

export async function initDBSequences() {
  // console.log('initDBSequences: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSequences)
  await beginTransaction(db)
  await db.execute(schemaSequences.text)
  await commitTransaction(db)
  // console.log('initDBSequences: DONE')
  return db
}

export async function initDBSequencesUser() {
  // console.log('initDBSequences: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSequencesUser)
  await beginTransaction(db)
  await db.execute(schemaSequences.text)
  await commitTransaction(db)
  // console.log('initDBSequences: DONE')
  return db
}

export async function initDBCollections() {
  // console.log('initDBCollections: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathCollections)
  await beginTransaction(db)
  await db.execute(schemaCollections.text)
  await commitTransaction(db)
  // console.log('initDBCollections: DONE')
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
