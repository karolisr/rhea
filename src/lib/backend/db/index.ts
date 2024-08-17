import Database from '@tauri-apps/plugin-sql'
import { BaseDirectory, mkdir } from '@tauri-apps/plugin-fs'

import { schemaTaxonomy } from './schema/taxonomy'
import { schemaSummaries } from './schema/summaries'
import { schemaSeqRecs } from './schema/seqrecs'
import { schemaSequences } from './schema/sequences'
import { schemaCollections } from './schema/collections'

export class DB extends Database {}

export const dbPathTaxonomy: string = 'sqlite:db/taxonomy.db'
export const dbPathSummaries: string = 'sqlite:db/summaries.db'
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
  await db.execute(schemaTaxonomy.text)
  // console.log('initDBTaxonomy: DONE')
  return db
}

export async function initDBSummaries() {
  // console.log('initDBSummaries: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSummaries)
  await db.execute(schemaSummaries.text)
  // console.log('initDBSummaries: DONE')
  return db
}

export async function initDBSeqRecs() {
  // console.log('initDBSeqRecs: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSeqRecs)
  await db.execute(schemaSeqRecs.text)
  // console.log('initDBSeqRecs: DONE')
  return db
}

export async function initDBSeqRecsUser() {
  // console.log('initDBSeqRecs: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSeqRecsUser)
  await db.execute(schemaSeqRecs.text)
  // console.log('initDBSeqRecs: DONE')
  return db
}

export async function initDBSequences() {
  // console.log('initDBSequences: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSequences)
  await db.execute(schemaSequences.text)
  // console.log('initDBSequences: DONE')
  return db
}

export async function initDBSequencesUser() {
  // console.log('initDBSequences: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathSequencesUser)
  await db.execute(schemaSequences.text)
  // console.log('initDBSequences: DONE')
  return db
}

export async function initDBCollections() {
  // console.log('initDBCollections: BEGIN')
  await prepareDBDir()
  const db: DB = await DB.load(dbPathCollections)
  await db.execute(schemaCollections.text)
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
