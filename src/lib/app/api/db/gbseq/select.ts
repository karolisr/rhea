import sql, { empty, join } from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { DB } from '$lib/app/api/db'

export async function getSeqRecs(collectionName: string, collectionIds: string[]) {
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
        records_collection_name
      WHERE
        id IN (${collectionIds})
      ;
    `

    rv = await db.select(_sql.text.replace('collection_name', collectionName), _sql.values)
  }
  unsubscribe()
  return rv
}

export async function getAllSeqRecs() {
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
        records
      ;
    `
    rv = await db.select(_sql.text, _sql.values)
  }
  unsubscribe()
  return rv
}
