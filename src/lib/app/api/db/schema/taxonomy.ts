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
  CREATE INDEX IF NOT EXISTS ix_tx_nodes_parent_tax_id ON "tx_nodes" ("parent_tax_id");
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
  CREATE INDEX IF NOT EXISTS ix_tx_names_name ON "tx_names" ("name");
  CREATE INDEX IF NOT EXISTS ix_tx_names_tax_id ON "tx_names" ("tax_id");
  CREATE INDEX IF NOT EXISTS ix_tx_names_name_class ON "tx_names" ("name_class");
  CREATE TABLE IF NOT EXISTS "tx_merged_nodes" (
    "old_tax_id" integer PRIMARY KEY NOT NULL,
    "new_tax_id" integer NOT NULL,
    FOREIGN KEY (new_tax_id) REFERENCES "tx_nodes" (tax_id)
  );
`
