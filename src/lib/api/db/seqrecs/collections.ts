import sql, { bulk } from 'sql-template-tag'
import { DB } from '$lib/api/db'
import type { Databases } from '$lib/svelte-stores/databases'

export async function addSeqRecsToCollection(
  accs: string[],
  collId: string,
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
) {
  if (accs.length === 0) return
  let db: DB | null = dbs[dbName]
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
}

export async function removeSeqRecsFromCollection(
  accs: string[],
  collId: string,
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
) {
  if (accs.length === 0) return
  let db: DB | null = dbs[dbName]
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
}
