------------------------------------------------------------------------------
-- DROP TABLE IF EXISTS gb_keywords;
-- DROP TABLE IF EXISTS gb_seqids;
-- DROP TABLE IF EXISTS gb_secondary_accns;
-- DROP TABLE IF EXISTS gb_comment_paragraphs;
-- DROP TABLE IF EXISTS gb_comments;
-- DROP TABLE IF EXISTS gb_alt_seq_items;
-- DROP TABLE IF EXISTS gb_alt_seq_data;
-- DROP TABLE IF EXISTS gb_struc_comment_items;
-- DROP TABLE IF EXISTS gb_struc_comments;
-- DROP TABLE IF EXISTS gb_authors;
-- DROP TABLE IF EXISTS gb_xrefs;
-- DROP TABLE IF EXISTS gb_intervals;
-- DROP TABLE IF EXISTS gb_qualifiers;
-- DROP TABLE IF EXISTS gb_features;
-- DROP TABLE IF EXISTS gb_feature_sets;
-- DROP TABLE IF EXISTS gb_references;
-- DROP TABLE IF EXISTS gb_records;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_records" (
  "accession_version" varchar PRIMARY KEY NOT NULL,
  "tax_id" integer NOT NULL,
  "length" integer NOT NULL,
  "moltype" varchar NOT NULL,
  "definition" varchar,
  "comment" varchar,
  "contig" varchar,
  "database_reference" varchar,
  "entry_version" varchar,
  "locus" varchar,
  "primary" varchar,
  "primary_accession" varchar,
  "project" varchar,
  "segment" varchar,
  "source" varchar,
  "source_db" varchar,
  "strandedness" varchar,
  "topology" varchar,
  "create_date" varchar,
  "create_release" varchar,
  "update_date" varchar,
  "update_release" varchar
  -- + feature_set?: GBFeatureSet[]
  -- + feature_table?: GBFeature[]
  -- + xrefs?: GBXref[]
  -- + keywords?: GBKeyword[]
  -- + alt_seq?: GBAltSeqData[]
  -- + other_seqids?: GBSeqid[]
  -- + secondary_accessions?: GBSecondary_accn[]
  -- + references?: GBReference[]
  -- + comment_set?: GBComment[]
  -- + struc_comments?: GBStrucComment[]
  -- FOREIGN KEY (tax_id) REFERENCES "tx_nodes" (tax_id)
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_feature_sets" (
  "accession_version" varchar NOT NULL,
  "feature_set_id" integer NOT NULL,
  "annot_source" varchar,
  -- + features: GBFeature[]
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version),
  PRIMARY KEY (
    "accession_version",
    "feature_set_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_features" (
  "accession_version" varchar NOT NULL,
  "feature_set_id" integer NOT NULL,
  "feature_id" integer NOT NULL,
  "key" varchar NOT NULL,
  "location" varchar NOT NULL,
  "operator" varchar,
  "partial3" boolean,
  "partial5" boolean,
  -- + intervals?: GBInterval[]
  -- + quals?: GBQualifier[]
  -- + xrefs?: GBXref[]
  FOREIGN KEY (
    accession_version,
    feature_set_id
  ) REFERENCES "gb_feature_sets" (
    accession_version,
    feature_set_id
  ),
  PRIMARY KEY (
    "accession_version",
    "feature_set_id",
    "feature_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_intervals" (
  "accession_version" varchar NOT NULL,
  "feature_set_id" integer NOT NULL,
  "feature_id" integer NOT NULL,
  "interval_id" integer NOT NULL,
  "accession" varchar NOT NULL,
  "from" integer,
  "to" integer,
  "point" integer,
  "iscomp" boolean,
  "interbp" boolean,
  FOREIGN KEY (
    accession_version,
    feature_set_id,
    feature_id
  ) REFERENCES "gb_features" (
    accession_version,
    feature_set_id,
    feature_id
  ),
  PRIMARY KEY (
    "accession_version",
    "feature_set_id",
    "feature_id",
    "interval_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_qualifiers" (
  "accession_version" varchar NOT NULL,
  "feature_set_id" integer NOT NULL,
  "feature_id" integer NOT NULL,
  "qualifier_id" integer NOT NULL,
  "name" varchar NOT NULL,
  "value" varchar,
  FOREIGN KEY (
    accession_version,
    feature_set_id,
    feature_id
  ) REFERENCES "gb_features" (
    accession_version,
    feature_set_id,
    feature_id
  ),
  PRIMARY KEY (
    "accession_version",
    "feature_set_id",
    "feature_id",
    "qualifier_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_xrefs" (
  "reference_id" integer NOT NULL,
  "accession_version" varchar NOT NULL,
  "feature_set_id" integer NOT NULL,
  "feature_id" integer NOT NULL,
  "xref_id" integer NOT NULL,
  "dbname" varchar NOT NULL,
  "id" varchar NOT NULL,
  FOREIGN KEY (
    accession_version,
    feature_set_id,
    feature_id
  ) REFERENCES "gb_features" (
    accession_version,
    feature_set_id,
    feature_id
  ),
  FOREIGN KEY (
    accession_version,
    reference_id
  ) REFERENCES "gb_references" (
    accession_version,
    reference_id
  ),
  PRIMARY KEY (
    "reference_id",
    "accession_version",
    "feature_set_id",
    "feature_id",
    "xref_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_keywords" (
  "accession_version" varchar NOT NULL,
  "keyword" varchar NOT NULL,
  "keyword_id" integer PRIMARY KEY NOT NULL,
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_alt_seq_data" (
  "accession_version" varchar NOT NULL,
  "alt_seq_data_id" integer NOT NULL,
  "name" varchar NOT NULL,
  -- + items?: GBAltSeqItem[]
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version),
  PRIMARY KEY (
    "accession_version",
    "alt_seq_data_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_alt_seq_items" (
  "alt_seq_data_id" integer NOT NULL,
  "accession_version" varchar NOT NULL,
  "feature_set_id" integer,
  "feature_id" integer,
  "interval_id" integer,
  "alt_seq_item_id" integer NOT NULL,
  "first_accn" varchar,
  "gap_comment" varchar,
  "gap_length" integer,
  "gap_linkage" varchar,
  "gap_type" varchar,
  "isgap" boolean,
  "last_accn" varchar,
  "value" varchar,
  FOREIGN KEY (
    accession_version,
    alt_seq_data_id
  ) REFERENCES "gb_alt_seq_data" (
    accession_version,
    alt_seq_data_id
  ),
  FOREIGN KEY (
    accession_version,
    feature_set_id,
    feature_id,
    interval_id
  ) REFERENCES "gb_intervals" (
    accession_version,
    feature_set_id,
    feature_id,
    interval_id
  ),
  PRIMARY KEY (
    "alt_seq_data_id",
    "accession_version",
    "alt_seq_item_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_seqids" (
  "accession_version" varchar NOT NULL,
  "seqid" varchar NOT NULL,
  "seqid_id" integer PRIMARY KEY NOT NULL,
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_secondary_accns" (
  "accession_version" varchar NOT NULL,
  "accn" varchar NOT NULL,
  "accn_id" integer PRIMARY KEY NOT NULL,
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_references" (
  "accession_version" varchar NOT NULL,
  "reference_id" integer NOT NULL,
  "journal" varchar NOT NULL,
  "reference" varchar NOT NULL,
  "consortium" varchar,
  "position" varchar,
  "pubmed" integer,
  "remark" varchar,
  "title" varchar,
  -- + authors?: GBAuthor[]
  -- + xref?: GBXref[]
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version),
  PRIMARY KEY (
    "accession_version",
    "reference_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_authors" (
  "accession_version" varchar NOT NULL,
  "reference_id" integer NOT NULL,
  "author_id" integer NOT NULL,
  "author" varchar NOT NULL,
  FOREIGN KEY (
    accession_version,
    reference_id
  ) REFERENCES "gb_references" (
    accession_version,
    reference_id
  ),
  PRIMARY KEY (
    "accession_version",
    "reference_id",
    "author_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_comments" (
  "accession_version" varchar NOT NULL,
  "comment_id" integer NOT NULL,
  "type" varchar,
  -- + paragraphs: GBCommentParagraph[]
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version),
  PRIMARY KEY (
    "accession_version",
    "comment_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_comment_paragraphs" (
  "accession_version" varchar NOT NULL,
  "comment_id" integer NOT NULL,
  "paragraph_id" integer NOT NULL,
  "paragraph" varchar NOT NULL,
  FOREIGN KEY (
    accession_version,
    comment_id
  ) REFERENCES "gb_comments" (
    accession_version,
    comment_id
  ),
  PRIMARY KEY (
    "accession_version",
    "comment_id",
    "paragraph_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_struc_comments" (
  "accession_version" varchar NOT NULL,
  "struc_comment_id" integer NOT NULL,
  "name" varchar,
  -- + items: GBStrucCommentItem[]
  FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version),
  PRIMARY KEY (
    "accession_version",
    "struc_comment_id"
  )
)
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gb_struc_comment_items" (
  "accession_version" varchar NOT NULL,
  "struc_comment_id" integer NOT NULL,
  "struc_comment_item_id" integer NOT NULL,
  "tag" varchar,
  "url" varchar,
  "value" varchar,
  FOREIGN KEY (
    accession_version,
    struc_comment_id
  ) REFERENCES "gb_struc_comments" (
    accession_version,
    struc_comment_id
  ),
  PRIMARY KEY (
    "accession_version",
    "struc_comment_id",
    "struc_comment_item_id"
  )
)
;
----------------------------------------------------------------------------
-- DROP TABLE IF EXISTS assoc_records_user
-- ;
CREATE TABLE IF NOT EXISTS "assoc_records_user" (
  "id" varchar NOT NULL,
  "record_id" varchar NOT NULL,
  PRIMARY KEY ("id", "record_id"),
  FOREIGN KEY (record_id) REFERENCES "gb_records" (accession_version)
  -- FOREIGN KEY (id) REFERENCES "collections.user" (id)
)
;
----------------------------------------------------------------------------
-- Views -------------------------------------------------------------------
----------------------------------------------------------------------------
-- DROP VIEW IF EXISTS records_simple
-- ;
CREATE VIEW IF NOT EXISTS records_simple (
  "Accession",
  "TaxID",
  "Length",
  "Type",
  "Definition"
) AS
SELECT
  gb_records.accession_version,
  gb_records.tax_id,
  gb_records.length,
  gb_records.moltype,
  gb_records.definition
FROM
  gb_records
;
----------------------------------------------------------------------------
-- @block drop records view
-- @conn seqrecs
DROP VIEW IF EXISTS records
;
-- @block records view
-- @conn seqrecs
CREATE VIEW IF NOT EXISTS records AS
SELECT
  records_simple."Accession",
  records_simple."Length" AS "Length",
  CASE
    WHEN records_simple."Type" = "AA" THEN SUM(
      records_simple."Length" * 3
    )
    ELSE records_simple."Length"
  END "Length (bp)",
  REPLACE(
    COALESCE(
      (
        SELECT
          q1."value"
        FROM
          gb_qualifiers AS q1
        WHERE
          q1.name = "organelle"
          AND q1.accession_version = records_simple."Accession"
          AND q1.feature_id = 1
      ),
      "nucleus"
    ),
    "plastid:",
    ""
  ) AS "Genetic Compartment",
  REPLACE(
    COALESCE(
      (
        SELECT
          q3."value"
        FROM
          gb_qualifiers AS q3
        WHERE
          q3.name = "mol_type"
          AND q3.accession_version = records_simple."Accession"
          AND q3.feature_id = 1
      ),
      records_simple."Type"
    ),
    "genomic DNA",
    "DNA"
  ) AS "Molecule Type",
  records_simple."TaxID",
  (
    SELECT
      q2."value"
    FROM
      gb_qualifiers AS q2
    WHERE
      q2.name = "organism"
      AND q2.accession_version = records_simple."Accession"
      AND q2.feature_id = 1
  ) AS "Organism",
  records_simple."Definition"
FROM
  records_simple
GROUP BY
  records_simple."Accession"
;
-- @block drop records_user view
-- @conn seqrecs
----------------------------------------------------------------------------
-- DROP VIEW IF EXISTS records_user
-- ;
-- @block create records_user view
-- @conn seqrecs
CREATE VIEW IF NOT EXISTS records_user AS
SELECT
  *
FROM
  assoc_records_user
  INNER JOIN records ON records.accession = assoc_records_user.record_id
;
----------------------------------------------------------------------------
-- @block drop fts_gb_records virtual table
-- @conn seqrecs
-- DROP TABLE IF EXISTS fts_gb_records
-- ;
-- @block create fts_gb_records virtual table from gb_records
-- @conn seqrecs
CREATE VIRTUAL TABLE IF NOT EXISTS fts_gb_records USING fts5 (
  "accession_version",
  "definition",
  "moltype",
  content = "gb_records",
  content_rowid = "rowid"
)
;
-- @block fts_gb_records triggers
-- @conn seqrecs
CREATE TRIGGER IF NOT EXISTS fts_gb_records_i AFTER INSERT ON gb_records BEGIN
INSERT INTO
  fts_gb_records (
    "accession_version",
    "definition",
    "moltype"
  )
VALUES
  (
    new."accession_version",
    new."definition",
    new."moltype"
  )
;
END
;
CREATE TRIGGER IF NOT EXISTS fts_gb_records_d AFTER DELETE ON gb_records BEGIN
INSERT INTO
  fts_gb_records (
    fts_gb_records,
    "accession_version",
    "definition",
    "moltype"
  )
VALUES
  (
    "delete",
    old."accession_version",
    old."definition",
    old."moltype"
  )
;
END
;
CREATE TRIGGER IF NOT EXISTS fts_gb_records_u AFTER
UPDATE ON gb_records BEGIN
INSERT INTO
  fts_gb_records (
    fts_gb_records,
    "accession_version",
    "definition",
    "moltype"
  )
VALUES
  (
    "delete",
    old."accession_version",
    old."definition",
    old."moltype"
  )
;
INSERT INTO
  fts_gb_records (
    "accession_version",
    "definition",
    "moltype"
  )
VALUES
  (
    new."accession_version",
    new."definition",
    new."moltype"
  )
;
END
;
