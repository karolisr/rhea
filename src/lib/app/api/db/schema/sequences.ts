import sql from 'sql-template-tag'

export const schemaSequences = sql`
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
  -- DROP TABLE IF EXISTS gb_sequences;
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
  );
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "gb_sequences" (
    "accession_version" varchar PRIMARY KEY NOT NULL,
    "sequence" varchar NOT NULL,
    FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
  );
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
  );
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
  );
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
  );
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
  );
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
  );
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "gb_keywords" (
    "accession_version" varchar NOT NULL,
    "keyword_id" integer PRIMARY KEY NOT NULL,
    "keyword" varchar NOT NULL,
    FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
  );
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
  );
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
  );
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "gb_seqids" (
    "accession_version" varchar NOT NULL,
    "seqid_id" integer PRIMARY KEY NOT NULL,
    "seqid" varchar NOT NULL,
    FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
  );
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "gb_secondary_accns" (
    "accession_version" varchar NOT NULL,
    "accn_id" integer PRIMARY KEY NOT NULL,
    "accn" varchar NOT NULL,
    FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
  );
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
  );
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
  );
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
  );
  ------------------------------------------------------------------------------
  CREATE TABLE IF NOT EXISTS "gb_comment_paragraphs" (
    "accession_version" varchar NOT NULL,
    "comment_id" integer NOT NULL,
    "paragraph_id" integer NOT NULL,
    "paragraph" varchar NOT NULL,
    FOREIGN KEY (accession_version, comment_id) REFERENCES "gb_comments" (accession_version, comment_id),
    PRIMARY KEY (
      "accession_version",
      "comment_id",
      "paragraph_id"
    )
  );
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
  );
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
  );
  ------------------------------------------------------------------------------
  -- ======================================================================== --
  ------------------------------------------------------------------------------
  -- CREATE TABLE IF NOT EXISTS gb_assoc_records_features (
  --   accession_version varchar NOT NULL,
  --   feature_id integer NOT NULL,
  --   PRIMARY KEY (accession_version, feature_id),
  --   FOREIGN KEY (accession_version) REFERENCES gb_records (accession_version),
  --   FOREIGN KEY (feature_id) REFERENCES gb_features (feature_id)
  -- );
  ------------------------------------------------------------------------------
  -- CREATE TABLE IF NOT EXISTS gb_assoc_feature_sets_features (
  --   feature_set_id integer NOT NULL,
  --   feature_id integer NOT NULL,
  --   PRIMARY KEY (feature_set_id, feature_id),
  --   FOREIGN KEY (feature_set_id) REFERENCES gb_feature_sets (feature_set_id),
  --   FOREIGN KEY (feature_id) REFERENCES gb_features (feature_id)
  -- );
  ------------------------------------------------------------------------------
  -- CREATE TABLE IF NOT EXISTS gb_assoc_features_intervals (
  --   feature_id integer NOT NULL,
  --   interval_id integer NOT NULL,
  --   PRIMARY KEY (feature_id, interval_id),
  --   FOREIGN KEY (feature_id) REFERENCES gb_features (feature_id),
  --   FOREIGN KEY (interval_id) REFERENCES gb_intervals (interval_id)
  -- );
  ------------------------------------------------------------------------------
  -- CREATE TABLE IF NOT EXISTS gb_assoc_features_qualifiers (
  --   feature_id integer NOT NULL,
  --   qualifier_id integer NOT NULL,
  --   PRIMARY KEY (feature_id, qualifier_id),
  --   FOREIGN KEY (feature_id) REFERENCES gb_features (feature_id),
  --   FOREIGN KEY (qualifier_id) REFERENCES gb_qualifiers (qualifier_id)
  -- );
  ------------------------------------------------------------------------------
  -- CREATE TABLE IF NOT EXISTS gb_assoc_features_xrefs (
  --   feature_id integer NOT NULL,
  --   xref_id integer NOT NULL,
  --   PRIMARY KEY (feature_id, xref_id),
  --   FOREIGN KEY (feature_id) REFERENCES gb_features (feature_id),
  --   FOREIGN KEY (xref_id) REFERENCES gb_xrefs (xref_id)
  -- );
  ------------------------------------------------------------------------------
  -- CREATE TABLE IF NOT EXISTS gb_assoc_records_xrefs (
  --   accession_version varchar NOT NULL,
  --   xref_id integer NOT NULL,
  --   PRIMARY KEY (accession_version, xref_id),
  --   FOREIGN KEY (accession_version) REFERENCES gb_records (accession_version),
  --   FOREIGN KEY (xref_id) REFERENCES gb_xrefs (xref_id)
  -- );
  ------------------------------------------------------------------------------
  -- CREATE TABLE IF NOT EXISTS gb_assoc_references_xrefs (
  --   reference_id integer NOT NULL,
  --   xref_id integer NOT NULL,
  --   PRIMARY KEY (reference_id, xref_id),
  --   FOREIGN KEY (reference_id) REFERENCES gb_references (reference_id),
  --   FOREIGN KEY (xref_id) REFERENCES gb_xrefs (xref_id)
  -- );
  ------------------------------------------------------------------------------
  -- ======================================================================== --
  ------------------------------------------------------------------------------
`
