import sql, { empty, join } from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { DB } from '$lib/app/api/db'

export async function getSeqRecList() {
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
        record_list;
    `
    rv = await db.select(_sql.text)
  }
  unsubscribe()
  return rv
}
