import sql from 'sql-template-tag'

export const schemaCollections = sql`
  ------------------------------------------------------------------------------
  -- DROP TABLE IF EXISTS assoc_collections_records;
  -- DROP TABLE IF EXISTS collections;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "collections" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "collections" (id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "assoc_collections_records" (
    "id" varchar NOT NULL,
    "record_id" varchar NOT NULL,
    PRIMARY KEY ("id", "record_id"),
    FOREIGN KEY (id) REFERENCES "collections" (id)
  );
  INSERT INTO
    collections (
      "parent_id",
      "id",
      "label",
      "notes"
    )
  VALUES
    (NULL, "ROOT", "ROOT", "")
  ON CONFLICT ("id") DO NOTHING;
  ------------------------------------------------------------------------------
  -- DROP TABLE IF EXISTS assoc_search_results_records;
  -- DROP TABLE IF EXISTS search_results;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "search_results" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "search_results" (id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "assoc_search_results_records" (
    "id" varchar NOT NULL,
    "record_id" varchar NOT NULL,
    PRIMARY KEY ("id", "record_id"),
    FOREIGN KEY (id) REFERENCES "search_results" (id)
  );
  INSERT INTO
    search_results (
      "parent_id",
      "id",
      "label",
      "notes"
    )
  VALUES
    (NULL, "ROOT", "ROOT", "")
  ON CONFLICT ("id") DO NOTHING;
  ------------------------------------------------------------------------------
  DROP TABLE IF EXISTS assoc_all_records_records;
  DROP TABLE IF EXISTS all_records;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "all_records" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "all_records" (id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS "assoc_all_records_records" (
    "id" varchar NOT NULL,
    "record_id" varchar NOT NULL,
    PRIMARY KEY ("id", "record_id"),
    FOREIGN KEY (id) REFERENCES "all_records" (id)
  );
  INSERT INTO
    all_records (
      "parent_id",
      "id",
      "label",
      "notes"
    )
  VALUES
    (NULL, "ROOT", "ROOT", ""),
    ("ROOT", "DNA", "DNA", ""),
    (
      "DNA",
      "GENOMES",
      "Genomes",
      ""
    ),
    ("ROOT", "RNA", "RNA", ""),
    ("ROOT", "AA", "AA", "")
  ON CONFLICT ("id") DO NOTHING;
  ------------------------------------------------------------------------------
`
