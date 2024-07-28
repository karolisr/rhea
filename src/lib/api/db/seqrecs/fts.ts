import sql from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import { DB } from '$lib/api/db'
import type { Databases } from '$lib/svelte-stores/databases'

export async function filterSeqRecs(
  term: string,
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
) {
  let db: DB | null = dbs[dbName]
  let rv: IndexedUndefined[] = []
  if (db !== null && term) {
    const _sql = sql`
      SELECT
        accession_version
      FROM
        fts_gb_records
      WHERE
        fts_gb_records MATCH ${term}
      ORDER BY
        bm25 (fts_gb_records)
      ;
    `
    rv = await db.select(_sql.text, _sql.values)
  }
  return rv
}
