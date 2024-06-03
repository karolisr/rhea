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
  DROP TABLE IF EXISTS sequence_type
  ;
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
    ("ROOT", "AA", "AA", ""),
    ("ROOT", "NT", "NT", ""),
    ("NT", "DNA", "DNA", ""),
    ("NT", "RNA", "RNA", ""),
    ("RNA", "cRNA", "cRNA", ""),
    ("RNA", "lncRNA", "lncRNA", ""),
    ("RNA", "mRNA", "mRNA", ""),
    ("RNA", "miRNA", "miRNA", ""),
    ("RNA", "ncRNA", "ncRNA", ""),
    ("RNA", "rRNA", "rRNA", ""),
    ("RNA", "snRNA", "snRNA", ""),
    ("RNA", "tRNA", "tRNA", ""),
    (
      "RNA",
      "transcribed-RNA",
      "transcribed-RNA",
      ""
    ),
    ("DNA", "Genomes", "Genomes", ""),
    ("Genomes", "plasmid", "Plasmids", ""),
    ("Genomes", "nuclear", "Nuclear", ""),
    (
      "Genomes",
      "Organelles",
      "Organelles",
      ""
    ),
    ("Organelles", "plastid", "Plastids", ""),
    (
      "Organelles",
      "mitochondrion",
      "Mitochondria",
      ""
    ),
    (
      "plastid",
      "chloroplast",
      "Chloroplasts",
      ""
    )
  ON CONFLICT ("id") DO NOTHING
  ;
  ------------------------------------------------------------------------------
`
