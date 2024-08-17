import sql from 'sql-template-tag'
import databases from '$lib/stores/databases'
import { DB } from '$lib/backend/db'

import type { IndexedUndefined } from '$lib/types'

export async function filterTaxonomy(term: string) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbTaxonomy
  })
  let rv: IndexedUndefined[] = []
  if (db !== null && term) {
    db = db as DB
    const _sql = sql`
      SELECT
        "tax_id",
        "name",
        "name_class"
      FROM
        fts_tx_names
      WHERE
        fts_tx_names MATCH ${term}
      ORDER BY
        bm25 (fts_tx_names)
      LIMIT
        20
      ;
    `
    rv = await db.select(_sql.text, _sql.values)
  }
  unsubscribe()
  return rv
}
