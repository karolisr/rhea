import sql from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/svelte-stores/databases'
import { DB } from '$lib/api/db'

export const cacheTaxIds: { [id: number]: number } = {}

async function _getLineage(db: DB, taxId: number, rv: number[] = []) {
  let _id: number = taxId
  let _pid: number = 1
  if (_id in cacheTaxIds) {
    _pid = cacheTaxIds[taxId]
    rv.push(_id)
  } else {
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
      _pid = _[0].parent_id as number
      cacheTaxIds[_id] = _pid
      rv.push(_id)
    }
  }
  if (_pid === 1) {
    rv.push(_pid)
  } else {
    await _getLineage(db, _pid, rv)
  }
}

export async function getLineage(taxId: number) {
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbTaxonomy
  })
  let rv: number[] = []
  if (db !== null) {
    await _getLineage(db, taxId, rv)
  }
  unsubscribe()
  return rv
}
