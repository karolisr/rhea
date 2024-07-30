import { v4 as uuid } from 'uuid'
import type { Collection } from '$lib/types'
import sql, { bulk, empty, join } from 'sql-template-tag'
import { DB } from '$lib/api/db'
import type { Databases } from '$lib/svelte-stores/databases'

async function _getCollections(
  ids: string[],
  idIsParentId: boolean,
  db: DB | null,
  tableName: string,
  count: boolean
) {
  const _sql = sql`
    SELECT
      ${count
      ? sql`
          parent_id AS id,
          COUNT(parent_id) AS row_count
        `
      : sql`
          "id",
          "parent_id",
          "label",
          "notes"
        `}
    FROM
      table_name ${ids.length === 0
      ? empty
      : sql`
          ${idIsParentId
            ? sql`
                WHERE
                  parent_id IN (
                    ${join(ids)}
                  )
                  AND NOT id = parent_id
              `
            : sql`
                WHERE
                  id IN (
                    ${join(ids)}
                  )
              `} ${count
            ? sql`
                GROUP BY
                  parent_id
              `
            : empty}
        `}
    ;
  `
  if (db !== null) {
    const result = await db.select(
      _sql.text.replace('table_name', tableName),
      _sql.values
    )
    return result
  } else {
    return []
  }
}

export async function getCollections(
  ids: string[],
  idIsParentId: boolean,
  db: DB | null,
  tableName: string
) {
  const result = await _getCollections(ids, idIsParentId, db, tableName, false)
  return result as Collection[]
}

export async function getCollectionsCount(
  ids: string[],
  idIsParentId: boolean,
  db: DB | null,
  tableName: string
) {
  const result = (await _getCollections(
    ids,
    idIsParentId,
    db,
    tableName,
    true
  )) as {
    id: string
    row_count: number
  }[]
  const rv: {
    [id: string]: number
  } = {}
  result.forEach((x) => {
    rv[x.id] = x.row_count
  })
  return rv
}

export async function createCollection(
  parentId: string,
  label: string,
  notes: string,
  db: DB | null,
  tableName: string
) {
  const id = uuid()
  const _sql = sql`
    INSERT INTO
      table_name (
        "parent_id",
        "id",
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
    ON CONFLICT ("id") DO NOTHING
    ;
  `
  if (db !== null) {
    await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
    return id
  } else {
    return null
  }
}

export async function deleteCollection(
  id: string,
  db: DB | null,
  tableName: string
) {
  if (id !== 'ROOT') {
    const _sql = sql`
      DELETE FROM table_name
      WHERE
        "id" = ${id}
      ;
    `
    if (db !== null) {
      await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
      return id
    } else {
      return null
    }
  } else {
    return null
  }
}

export async function relabelCollection(
  id: string,
  label: string,
  db: DB | null,
  tableName: string
) {
  const _sql = sql`
    UPDATE table_name
    SET
      label = ${label}
    WHERE
      id = ${id}
    ;
  `
  if (db !== null) {
    await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
    return label
  } else {
    return null
  }
}
export async function addToCollection(
  accs: string[],
  collId: string,
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser' | 'dbSummaries',
  tableName:
    | 'assoc_records_user'
    | 'assoc_esummseq_search_results' = 'assoc_records_user'
) {
  if (accs.length === 0) return
  let db: DB | null = dbs[dbName]
  if (db !== null) {
    const values: string[][] = []
    accs.forEach((acc) => values.push([collId, acc]))

    const _sql = sql`
      INSERT INTO
        table_name ("id", "record_id")
      VALUES
        ${bulk(values)}
      ON CONFLICT ("id", "record_id") DO NOTHING
      ;
    `
    await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
  }
}
export async function removeFromCollection(
  accs: string[],
  collId: string,
  dbs: Databases,
  dbName: 'dbSeqRecs' | 'dbSeqRecsUser' | 'dbSummaries',
  tableName:
    | 'assoc_records_user'
    | 'assoc_esummseq_search_results' = 'assoc_records_user'
) {
  if (accs.length === 0) return
  let db: DB | null = dbs[dbName]
  if (db !== null) {
    const _sql = sql`
      DELETE FROM table_name
      WHERE
        id = ${collId}
        AND record_id IN ${bulk([accs])}
      ;
    `
    await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
  }
}
