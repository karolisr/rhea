import sql, { bulk, empty } from 'sql-template-tag'
import databases from '$lib/app/svelte-stores/databases'
import { DB } from '$lib/app/api/db'

export async function addSeqRecsToCollection(accs: string[], collId: string) {
  if (accs.length === 0) return
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  if (db !== null) {
    db = db as DB

    const values: string[][] = []
    accs.forEach((acc) => values.push([collId, acc]))

    const _sql = sql`
      INSERT INTO
        assoc_records_user ("id", "record_id")
      VALUES
        ${bulk(values)}
      ON CONFLICT ("id", "record_id") DO NOTHING
      ;
    `
    await db.execute(_sql.text, _sql.values)
  }
  unsubscribe()
}

export async function removeSeqRecsFromCollection(accs: string[], collId: string) {
  if (accs.length === 0) return
  let dbs: Awaited<typeof databases> = await databases
  let db: DB | null = null
  const unsubscribe = dbs.subscribe((_) => {
    db = _.dbSequences
  })
  if (db !== null) {
    db = db as DB

    const _sql = sql`
      DELETE FROM assoc_records_user
      WHERE
        id = ${collId}
        AND record_id IN ${bulk([accs])}
      ;
    `
    await db.execute(_sql.text, _sql.values)
  }
  unsubscribe()
}
