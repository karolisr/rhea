import sql, { Sql, bulk, empty } from 'sql-template-tag'
import type { IndexedUndefined } from '$lib/types'
import type { Databases } from '$lib/svelte-stores/databases'
import { DB } from '$lib/api/db'

export async function getAllSeqRecs(
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
) {
  let db: DB | null = dbs[dbName]
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
  return rv
}

export async function getSeqRecIdsByCategory(
  category: 'moltype' | 'organelle' | 'other',
  terms: string[],
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser'
): Promise<string[]> {
  let db: DB | null = dbs[dbName]
  let _rv: IndexedUndefined[] = []

  let subSql: Sql = empty

  switch (category) {
    case 'moltype':
      subSql = sql`
        WHERE
          "moltype" IN ${bulk([terms])}
      `
      break

    case 'organelle':
      subSql = sql`
        WHERE
          "organelle" IN ${bulk([terms])}
      `
      break

    case 'other':
      if (terms.length === 1 && terms.includes('plasmid')) {
        subSql = sql`
          WHERE
            "plasmid" != ''
        `
      }
      break

    default:
      subSql = empty
      break
  }

  if (db !== null) {
    db = db as DB
    const _sql = sql`
      SELECT
        accession_version AS id
      FROM
        records ${subSql}
      ;
    `
    _rv = await db.select(_sql.text, _sql.values)
  }
  return _rv.map((v) => v['id'] as string)
}

// export async function getSeqRecsFromCollection(
//   collectionName: string,
//   collectionIds: string[]
// ) {
//   let dbs: Awaited<typeof databases> = await databases
//   let db: DB | null = null
//   const unsubscribe = dbs.subscribe((_) => {
//     db = _.dbSeqRecs
//   })
//   let rv: IndexedUndefined[] = []
//   if (db !== null) {
//     db = db as DB
//     const _sql = sql`
//       SELECT
//         *
//       FROM
//         records_collection_name
//       WHERE
//         id IN ${bulk([collectionIds])}
//       ;
//     `
//     rv = await db.select(
//       _sql.text.replace('collection_name', collectionName),
//       _sql.values
//     )
//   }
//   unsubscribe()
//   return rv
// }

// export async function getSequences(accs: string[]) {
//   let rv: IndexedUndefined[] = []
//   if (accs.length === 0) {
//     return rv
//   }
//   let dbs: Awaited<typeof databases> = await databases
//   let db: DB | null = null
//   const unsubscribe = dbs.subscribe((_) => {
//     db = _.dbSequences
//   })

//   if (db !== null) {
//     db = db as DB
//     const _sql = sql`
//       SELECT
//         "accession_version" AS "acc",
//         "sequence" AS "seq"
//       FROM
//         "gb_sequences"
//       WHERE
//         "accession_version" IN ${bulk([accs])}
//       ;
//     `
//     rv = await db.select(_sql.text, _sql.values)
//   }
//   unsubscribe()
//   return rv
// }
