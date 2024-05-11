import sql from 'sql-template-tag'

export const schemaCollections = sql`
  ------------------------------------------------------------------------------
  -- DROP TABLE IF EXISTS assoc_collections_records;
  -- DROP TABLE IF EXISTS collections;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "collections" (
    "parent_id" varchar,
    "collection_id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "collections" (collection_id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "assoc_collections_records" (
    "collection_id" varchar NOT NULL,
    "record_id" varchar NOT NULL,
    PRIMARY KEY ("collection_id", "record_id"),
    FOREIGN KEY (collection_id) REFERENCES "collections" (collection_id)
  );
  INSERT INTO
    collections (
      "parent_id",
      "collection_id",
      "label",
      "notes"
    )
  VALUES
    (NULL, "ROOT", "ROOT", "")
  ON CONFLICT ("collection_id") DO NOTHING;
  ------------------------------------------------------------------------------
`
