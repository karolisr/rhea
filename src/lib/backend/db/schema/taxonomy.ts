import sql from 'sql-template-tag'

export const schemaTaxonomy = sql`
  -- PRAGMA journal_mode = 'OFF'
  -- ;
  -- PRAGMA page_size = '32768'
  -- ;
  -- PRAGMA auto_vacuum = '1'
  -- ;
  -- VACUUM
  -- ;
  -- PRAGMA journal_mode = 'WAL'
  -- ;
  ------------------------------------------------------------------------------
  BEGIN TRANSACTION
  ;
  ------------------------------------------------------------------------------
  -- @block create tx_divisions table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_divisions" (
    "id" integer PRIMARY KEY NOT NULL,
    "code" varchar(3) NOT NULL,
    "name" varchar NOT NULL,
    "comments" varchar
  )
  ;
  -- @block create tx_genetic_codes table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_genetic_codes" (
    "id" integer PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "translation_table" varchar(64) NOT NULL,
    "start_stop" varchar(64) NOT NULL
  )
  ;
  -- @block create tx_deleted_nodes table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_deleted_nodes" (
    "tax_id" integer PRIMARY KEY NOT NULL
  )
  ;
  -- @block create tx_citations table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_citations" (
    "id" integer PRIMARY KEY NOT NULL,
    "citation_key" varchar,
    "medline_id" varchar,
    "url" varchar,
    "text" varchar
  )
  ;
  -- @block create tx_images table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_images" (
    "id" integer PRIMARY KEY NOT NULL,
    "image_key" varchar NOT NULL,
    "url" varchar NOT NULL,
    "license" varchar NOT NULL,
    "attribution" varchar,
    "source" varchar NOT NULL
  )
  ;
  -- @block create tx_codons table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_codons" (
    "id" integer PRIMARY KEY NOT NULL,
    "codon" varchar(3) NOT NULL
  )
  ;
  -- @block create tx_nodes table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_nodes" (
    "tax_id" integer PRIMARY KEY NOT NULL,
    "parent_tax_id" integer NOT NULL,
    "rank" varchar NOT NULL,
    "embl_code" varchar,
    "division_id" integer NOT NULL,
    "genetic_code_id" integer NOT NULL,
    "mitochondrial_genetic_code_id" integer,
    "genbank_hidden_flag" boolean NOT NULL,
    "comments" varchar,
    FOREIGN KEY (parent_tax_id) REFERENCES "tx_nodes" (tax_id),
    FOREIGN KEY (division_id) REFERENCES "tx_divisions" (id),
    FOREIGN KEY (genetic_code_id) REFERENCES "tx_genetic_codes" (id),
    FOREIGN KEY (
      mitochondrial_genetic_code_id
    ) REFERENCES "tx_genetic_codes" (id)
  )
  ;
  CREATE INDEX IF NOT EXISTS ix_tx_nodes_tax_id ON "tx_nodes" ("tax_id" ASC)
  ;
  CREATE INDEX IF NOT EXISTS ix_tx_nodes_parent_tax_id ON "tx_nodes" ("parent_tax_id" ASC)
  ;
  CREATE INDEX IF NOT EXISTS ix_tx_nodes_tax_id_parent_tax_id ON "tx_nodes" (
    "tax_id" ASC,
    "parent_tax_id" ASC
  )
  ;
  -- @block create tx_assoc_nodes_citations table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_assoc_nodes_citations" (
    "tax_id" integer NOT NULL,
    "citation_id" integer NOT NULL,
    FOREIGN KEY (tax_id) REFERENCES "tx_nodes" (tax_id),
    FOREIGN KEY (citation_id) REFERENCES "tx_citations" (id),
    PRIMARY KEY ("tax_id", "citation_id")
  )
  ;
  -- @block create tx_assoc_nodes_images table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_assoc_nodes_images" (
    "tax_id" integer NOT NULL,
    "img_id" integer NOT NULL,
    FOREIGN KEY (tax_id) REFERENCES "tx_nodes" (tax_id),
    FOREIGN KEY (img_id) REFERENCES "tx_images" (id),
    PRIMARY KEY ("tax_id", "img_id")
  )
  ;
  -- @block create tx_names table
  -- @conn taxonomy
  CREATE TABLE IF NOT EXISTS "tx_names" (
    "id" integer PRIMARY KEY NOT NULL,
    "tax_id" integer NOT NULL,
    "name" varchar NOT NULL,
    "unique_name" varchar,
    "name_class" varchar NOT NULL,
    FOREIGN KEY (tax_id) REFERENCES "tx_nodes" (tax_id)
  )
  ;
  CREATE INDEX IF NOT EXISTS ix_tx_names_name_class ON "tx_names" ("name_class" ASC)
  ;
  CREATE INDEX IF NOT EXISTS ix_tx_names_tax_id ON "tx_names" ("tax_id" ASC)
  ;
  CREATE INDEX IF NOT EXISTS ix_tx_names_name ON "tx_names" ("name" ASC)
  ;
  CREATE TABLE IF NOT EXISTS "tx_merged_nodes" (
    "old_tax_id" integer PRIMARY KEY NOT NULL,
    "new_tax_id" integer NOT NULL,
    FOREIGN KEY (new_tax_id) REFERENCES "tx_nodes" (tax_id)
  )
  ;
  -- @block create tree view
  -- @conn taxonomy
  CREATE VIEW IF NOT EXISTS tree (
    id,
    parent_id,
    label,
    notes
  ) AS
  SELECT
    tx_nodes.tax_id,
    tx_nodes.parent_tax_id,
    tx_names.name,
    tx_nodes.rank
  FROM
    tx_nodes
    LEFT JOIN tx_names USING (tax_id)
  WHERE
    tx_names.name_class NOT IN (
      "acronym",
      "authority",
      "blast name",
      "common name",
      "equivalent name",
      "genbank acronym",
      "genbank common name",
      "in-part",
      "includes",
      "synonym",
      "type material"
    )
    -- tx_names.name_class IN (
    --   "scientific name"
    -- )
  ;
  -- @block drop name_classes view
  -- @conn taxonomy
  -- DROP VIEW IF EXISTS name_classes
  -- ;
  -- @block create name_classes view
  -- @conn taxonomy
  CREATE VIEW IF NOT EXISTS name_classes ("name_class") AS
  SELECT DISTINCT
    tx_names.name_class
  FROM
    tx_names
  ORDER BY
    "name_class" ASC
  ;
  -- @block create ranks view
  -- @conn taxonomy
  CREATE VIEW IF NOT EXISTS ranks ("rank") AS
  SELECT DISTINCT
    tx_nodes.rank
  FROM
    tx_nodes
  ORDER BY
    "rank" ASC
  ;
  -- @block drop fts_tx_names virtual table
  -- @conn taxonomy
  -- DROP TABLE IF EXISTS fts_tx_names
  -- ;
  -- @block create fts_tx_names virtual table from tx_names
  -- @conn taxonomy
  -- CREATE VIRTUAL TABLE IF NOT EXISTS fts_tx_names USING fts5 (
  --   "id",
  --   "tax_id",
  --   "name",
  --   "name_class",
  --   content = "tx_names",
  --   content_rowid = "id"
  -- )
  -- ;
  -- @block populate fts_tx_names virtual table
  -- @conn taxonomy
  -- INSERT INTO
  --   fts_tx_names (
  --     "id",
  --     "tax_id",
  --     "name",
  --     "name_class"
  --   )
  -- SELECT
  --   "id",
  --   "tax_id",
  --   "name",
  --   "name_class"
  -- FROM
  --   tx_names
  -- ;
  ------------------------------------------------------------------------------
  COMMIT TRANSACTION
  ;
  ------------------------------------------------------------------------------
`
