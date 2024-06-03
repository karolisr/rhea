import sql, { bulk } from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { DB } from '$lib/app/api/db'

export async function getSeqRecsFromCollection(collectionName: string, collectionIds: string[]) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  let rv: IndexedUndefined[] = []
  if (db !== null) {
    db = db as DB
    const _sql = sql`
      SELECT
        *
      FROM
        records_collection_name
      WHERE
        id IN ${bulk([collectionIds])}
      ;
    `
    rv = await db.select(_sql.text.replace('collection_name', collectionName), _sql.values)
  }
  unsubscribe()
  return rv
}

export async function getAllSeqRecs() {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  let rv: IndexedUndefined[] = []
  if (db !== null) {
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

export async function getSeqRecsByType(types: string[]) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  let rv: IndexedUndefined[] = []
  if (db !== null) {
    db = db as DB
    const _sql = sql`
      SELECT
        *
      FROM
        records
      WHERE
        "Genetic Compartment" IN ${bulk([types])}
        OR "Molecule Type" IN ${bulk([types])}
      ;
    `
    // console.log(_sql.text, _sql.values)
    rv = await db.select(_sql.text, _sql.values)
  }
  unsubscribe()
  return rv
}
