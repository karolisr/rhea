import { v4 as uuid } from 'uuid'
import Database from '@tauri-apps/plugin-sql'
import { dbPathCollections } from '..'
import type { Collection } from '$lib/types'
import sql from 'sql-template-tag'

export const getCollections = async (
  id: string,
  idIsParentId: boolean = false
) => {
  let col = 'collection_id'
  if (idIsParentId) col = 'parent_id'
  const _sql = sql`
    SELECT
      "collection_id" AS "id",
      "parent_id",
      "label",
      "notes"
    FROM
      collections
    WHERE
      ${idIsParentId ? sql`parent_id = ${id}` : sql`id = ${id}`};
  `
  const db: Database = await Database.load(dbPathCollections)
  const result: Collection[] = await db.select(_sql.text, _sql.values)
  await db.close()
  return result
}

export const createCollection = async (
  parentId: string,
  label: string,
  notes: string = ''
) => {
  const id = uuid()
  const _sql = sql`
    INSERT INTO
      collections (
        "parent_id",
        "collection_id",
        "label",
        "notes"
      )
    VALUES
      (
        ${parentId},
        ${id},
        ${label},
        ${notes}
      )
    ON CONFLICT ("collection_id") DO NOTHING;
  `
  const db: Database = await Database.load(dbPathCollections)
  await db.execute(_sql.text, _sql.values)
  await db.close()
  return id
}

export const deleteCollection = async (id: string) => {
  if (id !== 'ROOT') {
    const _sql = sql`
      DELETE FROM collections
      WHERE
        "collection_id" = ${id};
    `
    const db: Database = await Database.load(dbPathCollections)
    await db.execute(_sql.text, _sql.values)
    await db.close()
    return id
  } else {
    return null
  }
}

export const relabelCollection = async (id: string, label: string) => {
  const _sql = sql`
    UPDATE collections
    SET
      label = ${label}
    WHERE
      collection_id = ${id};
  `
  const db: Database = await Database.load(dbPathCollections)
  await db.execute(_sql.text, _sql.values)
  await db.close()
  return label
}

// export const pruneCollections = async (db: IDBPDatabase<DBMain>) => {
//   const obs = await db.getAll('collections')
//   const ids = await db.getAllKeys('collections')
//   const _: string[] = []
//   for (let i = 0; i < obs.length; i++) {
//     const ob = obs[i]
//     const pid = ob.id_parent
//     if (pid !== 'NONE' && !ids.includes(pid)) {
//       _.push(ob.id)
//       await db_main_del(ob.id, db, 'collections')
//     }
//   }
// }

// export const relabelCollection = async (
//   id: string,
//   label: string,
//   db: IDBPDatabase<DBMain>
// ) => {
//   const _ = await db_main_get(id, db, 'collections')
//   _.label = label
//   await db_main_put([_], db, 'collections')
// }
