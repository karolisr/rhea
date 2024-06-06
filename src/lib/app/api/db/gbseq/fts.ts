import sql from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { DB } from '$lib/app/api/db'

export async function filterSeqRecs(term: string) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  let rv: IndexedUndefined[] = []
  if (db !== null && term) {
    db = db as DB
    const _sql = sql`
      SELECT
        accession_version AS "Accession"
        -- bm25 (fts_gb_records),
        -- highlight (fts_gb_records, 1, '<mark>', '</mark>') "highlight",
        -- snippet (fts_gb_records, 1, 'A', 'B', 'C', 2) "snippet",
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
  unsubscribe()
  return rv
}
