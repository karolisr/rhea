import sql from 'sql-template-tag'

export const schemaCollections = sql`
  ------------------------------------------------------------------------------
  -- DROP TABLE IF EXISTS user
  -- ;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "user" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "user" (id) ON DELETE CASCADE
  )
  ;
  INSERT INTO
    user ("parent_id", "id", "label", "notes")
  VALUES
    (NULL, "ROOT", "ROOT", "")
  ON CONFLICT ("id") DO NOTHING
  ;
  ------------------------------------------------------------------------------
  -- DROP TABLE IF EXISTS search_results
  -- ;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "search_results" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "search_results" (id) ON DELETE CASCADE
  )
  ;
  INSERT INTO
    search_results ("parent_id", "id", "label", "notes")
  VALUES
    (NULL, "ROOT", "ROOT", "")
  ON CONFLICT ("id") DO NOTHING
  ;
  ------------------------------------------------------------------------------
  -- DROP TABLE IF EXISTS sequence_type
  -- ;
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "sequence_type" (
    "parent_id" varchar,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "notes" varchar,
    FOREIGN KEY (parent_id) REFERENCES "sequence_type" (id) ON DELETE CASCADE
  )
  ;
  INSERT INTO
    sequence_type ("parent_id", "id", "label", "notes")
  VALUES
    (NULL, "ROOT", "ROOT", ""),
    ("ROOT", "NUCLEO", "NT", ""),
    ("NUCLEO", "DNA", "DNA", ""),
    ("NUCLEO", "RNA", "RNA", ""),
    ("ROOT", "AA", "AA", ""),
    ("DNA", "GENOMES", "Genomes", ""),
    ("GENOMES", "NUC", "Nuclear", ""),
    ("GENOMES", "ORGN", "Organelles", ""),
    ("ORGN", "PLAST", "Plastids", ""),
    ("PLAST", "CP", "Chloroplasts", ""),
    ("ORGN", "MT", "Mitochondria", "")
  ON CONFLICT ("id") DO NOTHING
  ;
  ------------------------------------------------------------------------------
`
