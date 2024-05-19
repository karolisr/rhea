import sql from 'sql-template-tag'

export const schemaCollections = sql`
  ------------------------------------------------------------------------------
  -- DROP TABLE IF EXISTS collections;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "collections" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "collections" (id) ON DELETE CASCADE
  )
  ;
  INSERT INTO
    collections ("parent_id", "id", "label", "notes")
  VALUES
    (NULL, "ROOT", "ROOT", "")
  ON CONFLICT ("id") DO NOTHING
  ;
  ------------------------------------------------------------------------------
  DROP TABLE IF EXISTS search_results
  ;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "search_results" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "search_results" (id) ON DELETE CASCADE
  )
  ;
  -- DROP TABLE IF EXISTS assoc_search_results_records;
  -- CREATE TABLE IF NOT EXISTS "assoc_search_results_records" (
  --   "id" varchar NOT NULL,
  --   "record_id" varchar NOT NULL,
  --   PRIMARY KEY ("id", "record_id"),
  --   FOREIGN KEY (id) REFERENCES "search_results" (id)
  -- );
  INSERT INTO
    search_results ("parent_id", "id", "label", "notes")
  VALUES
    (NULL, "ROOT", "ROOT", "")
  ON CONFLICT ("id") DO NOTHING
  ;
  ------------------------------------------------------------------------------
  DROP TABLE IF EXISTS seqtype
  ;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "seqtype" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "seqtype" (id) ON DELETE CASCADE
  )
  ;
  -- DROP TABLE IF EXISTS assoc_seqtype_records;
  -- CREATE TABLE IF NOT EXISTS "assoc_seqtype_records" (
  --   "id" varchar NOT NULL,
  --   "record_id" varchar NOT NULL,
  --   PRIMARY KEY ("id", "record_id"),
  --   FOREIGN KEY (id) REFERENCES "seqtype" (id)
  -- );
  INSERT INTO
    seqtype ("parent_id", "id", "label", "notes")
  VALUES
    (NULL, "ROOT", "ROOT", ""),
    ("ROOT", "DNA", "DNA", ""),
    ("DNA", "GENOMES", "Genomes", ""),
    ("ROOT", "RNA", "RNA", ""),
    ("ROOT", "AA", "AA", "")
  ON CONFLICT ("id") DO NOTHING
  ;
  ------------------------------------------------------------------------------
`
