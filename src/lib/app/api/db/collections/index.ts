import { v4 as uuid } from 'uuid'
import type { Collection } from '$lib/types'
import sql, { empty } from 'sql-template-tag'
import { DB } from '..'

export const getCollections = async (
  id: string,
  idIsParentId: boolean,
  db: DB,
  tableName: string
) => {
  const _sql = sql`
    SELECT
      "collection_id" AS "id",
      "parent_id",
      "label",
      "notes"
    FROM
      table_name ${id === ''
      ? empty
      : sql`
          ${idIsParentId
            ? sql`
                WHERE
                  parent_id = ${id}
              `
            : sql`
                WHERE
                  id = ${id}
              `}
        `};
  `
  const result: Collection[] = await db.select(
    _sql.text.replace('table_name', tableName),
    _sql.values
  )
  return result
}

export const createCollection = async (
  parentId: string,
  label: string,
  notes: string,
  db: DB,
  tableName: string
) => {
  const id = uuid()
  const _sql = sql`
    INSERT INTO
      table_name (
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
  await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
  return id
}

export const deleteCollection = async (
  id: string,
  db: DB,
  tableName: string
) => {
  if (id !== 'ROOT') {
    const _sql = sql`
      DELETE FROM table_name
      WHERE
        "collection_id" = ${id};
    `
    await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
    return id
  } else {
    return null
  }
}

export const relabelCollection = async (
  id: string,
  label: string,
  db: DB,
  tableName: string
) => {
  const _sql = sql`
    UPDATE table_name
    SET
      label = ${label}
    WHERE
      collection_id = ${id};
  `
  await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
  return label
}
