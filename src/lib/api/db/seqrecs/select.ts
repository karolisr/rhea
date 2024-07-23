import sql, { Sql, bulk, empty } from 'sql-template-tag'
import { DB } from '$lib/api/db'
import type { Databases } from '$lib/svelte-stores/databases'
import type { IndexedUndefined } from '$lib/types'

export async function getAllSeqRecs(
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
) {
  let db: DB | null = dbs[dbName]
  let rv: IndexedUndefined[] = []
  if (db !== null) {
    db = db as DB
    const _sql = sql`
      SELECT
        *
      FROM
        "records"
      ;
    `
    rv = await db.select(_sql.text, _sql.values)
  }
  return rv
}

export async function getSeqRecIdsByCategory(
  category: 'moltype' | 'organelle' | 'other',
  terms: string[],
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
): Promise<Set<string>> {
  let db: DB | null = dbs[dbName]
  let _rv: IndexedUndefined[] = []
  let subSql: Sql = empty
  switch (category) {
    case 'moltype':
      subSql = sql`
        WHERE
          "moltype" IN ${bulk([terms])}
      `
      break

    case 'organelle':
      subSql = sql`
        WHERE
          "organelle" IN ${bulk([terms])}
      `
      break

    case 'other':
      if (terms.length === 1 && terms.includes('plasmid')) {
        subSql = sql`
          WHERE
            "plasmid" != ''
        `
      }
      break

    default:
      subSql = empty
      break
  }

  if (db !== null) {
    db = db as DB
    const _sql = sql`
      SELECT
        "accession_version"
      FROM
        "records" ${subSql}
      ;
    `
    _rv = await db.select(_sql.text, _sql.values)
  }
  return new Set<string>(_rv.map((v) => v['accession_version'] as string))
}

export async function getSeqRecIdsForCollections(
  collectionName: string,
  collectionIds: string[],
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
): Promise<Set<string>> {
  let db: DB | null = dbs[dbName]
  let _rv: IndexedUndefined[] = []
  if (db !== null) {
    db = db as DB
    const _sql = sql`
      SELECT
        "accession_version"
      FROM
        "records_collection_name"
      WHERE
        "id" IN ${bulk([collectionIds])}
      ;
    `
    _rv = await db.select(
      _sql.text.replace('collection_name', collectionName),
      _sql.values
    )
  }
  return new Set<string>(_rv.map((v) => v['accession_version'] as string))
}

export async function getSequences(
  accs: string[],
  dbs: Databases,
  dbName: 'dbSequences' | 'dbSequencesUser'
) {
  let rv: IndexedUndefined[] = []
  if (accs.length === 0) {
    return rv
  }
  let db: DB | null = dbs[dbName]
  if (db !== null) {
    db = db as DB
    const _sql = sql`
      SELECT
        "accession_version",
        "sequence"
      FROM
        "gb_sequences"
      WHERE
        "accession_version" IN ${bulk([accs])}
      ;
    `
    rv = await db.select(_sql.text, _sql.values)
  }
  return rv
}
