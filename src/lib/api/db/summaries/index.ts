import sql, { bulk } from 'sql-template-tag'
import { DB } from '$lib/api/db'
import type { Databases } from '$lib/svelte-stores/databases'
import type { IndexedUndefined } from '$lib/types'

import { insertSeqSummaries as _insertSeqSummaries } from './insert'

export const insertSeqSummaries = _insertSeqSummaries

export async function getAllSeqSummaries(
  dbs: Databases,
  dbName: 'dbSummaries' = 'dbSummaries',
  tableName: 'esummseq_search_results' = 'esummseq_search_results'
) {
  let db: DB | null = dbs[dbName]
  let rv: IndexedUndefined[] = []
  if (db !== null) {
    const _sql = sql`
      SELECT
        *
      FROM
        "table_name"
      ;
    `
    rv = await db.select(
      _sql.text.replace('table_name', tableName),
      _sql.values
    )
  }
  return rv
}

export async function getSeqSummariesForCollections(
  collectionIds: string[],
  dbs: Databases,
  dbName: 'dbSummaries' = 'dbSummaries',
  tableName: 'esummseq_search_results' = 'esummseq_search_results'
): Promise<Set<string>> {
  let db: DB | null = dbs[dbName]
  let _rv: IndexedUndefined[] = []
  if (db !== null && collectionIds.length > 0) {
    const _sql = sql`
      SELECT
        "accessionversion"
      FROM
        "table_name"
      WHERE
        "id" IN ${bulk([collectionIds])}
      ;
    `
    _rv = await db.select(
      _sql.text.replace('table_name', tableName),
      _sql.values
    )
  }
  return new Set<string>(_rv.map((v) => v['accessionversion'] as string))
}

export async function deleteSeqSummaries(
  ids: string[],
  dbs: Databases,
  dbName: 'dbSummaries' = 'dbSummaries',
  tableName: 'esummseq' = 'esummseq'
) {
  let db: DB | null = dbs[dbName]
  if (db !== null && ids.length > 0) {
    const _sql = sql`
      DELETE FROM "table_name"
      WHERE
        "accessionversion" IN ${bulk([ids])}
      ;
    `
    await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
  }
}
