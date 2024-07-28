import sql, { bulk } from 'sql-template-tag'
import { DB } from '$lib/api/db'
import type { Databases } from '$lib/svelte-stores/databases'

export async function deleteSeqRecs(
  ids: string[],
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
) {
  let db: DB | null = dbs[dbName]
  if (db !== null) {
    const _sql = sql`
      DELETE FROM "gb_records"
      WHERE
        "accession_version" IN ${bulk([ids])}
      ;
    `
    await db.execute(_sql.text, _sql.values)
  }
}
