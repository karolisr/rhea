import sql, { bulk } from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { DB } from '$lib/app/api/db'

const cache: { [id: number]: number } = {}

async function _getLineage(db: DB | null, taxId: number, rv: number[] = []) {
  let _id: number = taxId
  let _pid: number = 0
  if (taxId in cache) {
    _id = taxId
    rv.push(_id)
    _pid = cache[taxId]
    // console.log(_id)
    // rv.push(_pid)
  } else {
    if (db !== null) {
      db = db as DB
      const _sql = sql`
        SELECT
          id,
          parent_id
        FROM
          tree
        WHERE
          id = ${taxId}
        ;
      `
      const _: IndexedUndefined[] = await db.select(_sql.text, _sql.values)
      if (_[0]) {
        _id = _[0].id as number
        _pid = _[0].parent_id as number
        cache[_id] = _pid

        rv.push(_id)
        // rv.push(_pid)
      }
    }
  }
  if (_pid !== 1) {
    await _getLineage(db, _pid, rv)
    // rv.push(_pid)
  } else {
    // rv.push(_id)
    rv.push(_pid)
  }
}

export async function getLineage(taxId: number) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbTaxonomy
  })
  let rv: number[] = []
  await _getLineage(db, taxId, rv)
  unsubscribe()
  return rv
}
