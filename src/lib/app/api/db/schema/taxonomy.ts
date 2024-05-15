import sql from 'sql-template-tag'

export const schemaTaxonomy = sql`
  CREATE TABLE IF NOT EXISTS "tx_divisions" (
    "id" integer PRIMARY KEY NOT NULL,
    "code" varchar(3) NOT NULL,
    "name" varchar NOT NULL,
    "comments" varchar
  );
  CREATE TABLE IF NOT EXISTS "tx_genetic_codes" (
    "id" integer PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "translation_table" varchar(64) NOT NULL,
    "start_stop" varchar(64) NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "tx_deleted_nodes" (
    "tax_id" integer PRIMARY KEY NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "tx_citations" (
    "id" integer PRIMARY KEY NOT NULL,
    "citation_key" varchar,
    "medline_id" varchar,
    "url" varchar,
    "text" varchar
  );
  CREATE TABLE IF NOT EXISTS "tx_images" (
    "id" integer PRIMARY KEY NOT NULL,
    "image_key" varchar NOT NULL,
    "url" varchar NOT NULL,
    "license" varchar NOT NULL,
    "attribution" varchar,
    "source" varchar NOT NULL
  );
  CREATE TABLE IF NOT EXISTS "tx_codons" (
    "id" integer PRIMARY KEY NOT NULL,
    "codon" varchar(3) NOT NULL
  );
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
    FOREIGN KEY (mitochondrial_genetic_code_id) REFERENCES "tx_genetic_codes" (id)
  );
  CREATE INDEX IF NOT EXISTS ix_tx_nodes_tax_id ON "tx_nodes" ("tax_id" ASC);
  CREATE INDEX IF NOT EXISTS ix_tx_nodes_parent_tax_id ON "tx_nodes" ("parent_tax_id" ASC);
  CREATE INDEX IF NOT EXISTS ix_tx_nodes_tax_id_parent_tax_id ON "tx_nodes" (
    "tax_id" ASC,
    "parent_tax_id" ASC
  );
  CREATE TABLE IF NOT EXISTS "tx_assoc_nodes_citations" (
    "tax_id" integer NOT NULL,
    "citation_id" integer NOT NULL,
    FOREIGN KEY (tax_id) REFERENCES "tx_nodes" (tax_id),
    FOREIGN KEY (citation_id) REFERENCES "tx_citations" (id),
    PRIMARY KEY ("tax_id", "citation_id")
  );
  CREATE TABLE IF NOT EXISTS "tx_assoc_nodes_images" (
    "tax_id" integer NOT NULL,
    "img_id" integer NOT NULL,
    FOREIGN KEY (tax_id) REFERENCES "tx_nodes" (tax_id),
    FOREIGN KEY (img_id) REFERENCES "tx_images" (id),
    PRIMARY KEY ("tax_id", "img_id")
  );
  CREATE TABLE IF NOT EXISTS "tx_names" (
    "id" integer PRIMARY KEY NOT NULL,
    "tax_id" integer NOT NULL,
    "name" varchar NOT NULL,
    "unique_name" varchar,
    "name_class" varchar NOT NULL,
    FOREIGN KEY (tax_id) REFERENCES "tx_nodes" (tax_id)
  );
  CREATE INDEX IF NOT EXISTS ix_tx_names_name_class ON "tx_names" ("name_class" ASC);
  CREATE INDEX IF NOT EXISTS ix_tx_names_tax_id ON "tx_names" ("tax_id" ASC);
  CREATE INDEX IF NOT EXISTS ix_tx_names_name ON "tx_names" ("name" ASC);
  CREATE TABLE IF NOT EXISTS "tx_merged_nodes" (
    "old_tax_id" integer PRIMARY KEY NOT NULL,
    "new_tax_id" integer NOT NULL,
    FOREIGN KEY (new_tax_id) REFERENCES "tx_nodes" (tax_id)
  );
  ----------------------------------------------------------------------------
  -- Views -------------------------------------------------------------------
  ----------------------------------------------------------------------------
  -- DROP VIEW IF EXISTS tree;
  CREATE VIEW IF NOT EXISTS tree (id, parent_id, label, notes) AS
  SELECT
    tx_nodes.tax_id,
    tx_nodes.parent_tax_id,
    tx_names.name,
    tx_nodes.rank
  FROM
    tx_nodes
    LEFT JOIN tx_names USING (tax_id)
  WHERE
    -- tx_names.name_class IN (
    --   "scientific name"
    -- );
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
    );
  ----------------------------------------------------------------------------
  -- DROP VIEW IF EXISTS name_classes;
  CREATE VIEW IF NOT EXISTS name_classes (name_classe) AS
  SELECT DISTINCT
    tx_names.name_class
  FROM
    tx_names;
  ----------------------------------------------------------------------------
`
