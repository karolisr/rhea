import sql, { empty, join } from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { DB } from '$lib/app/api/db'

export async function getSeqRecList(collection: string) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | undefined = undefined
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  let rv: IndexedUndefined[] = []
  if (db !== undefined) {
    db = db as DB
    const _sql = sql`
      SELECT
        *
      FROM
        records_in_collection_list
      WHERE
        id = ${collection}
      ;
    `
    rv = await db.select(_sql.text, _sql.values)
  }
  unsubscribe()
  return rv
}
