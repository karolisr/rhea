-- PRAGMA journal_mode = 'OFF'
-- ;
-- PRAGMA page_size = '4096'
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
-- DROP TABLE IF EXISTS esummseq
-- ;
CREATE TABLE IF NOT EXISTS "esummseq" (
  "accessionversion" varchar PRIMARY KEY NOT NULL,
  "assemblyacc" varchar,
  "assemblygi" integer,
  "biomol" varchar,
  "biosample" varchar,
  "caption" varchar,
  "completeness" varchar,
  "createdate" varchar,
  "extra" varchar,
  "flags" integer,
  "geneticcode" integer,
  "genome" varchar,
  "gi" integer,
  "moltype" varchar,
  "organism" varchar,
  "projectid" varchar,
  "segsetsize" varchar,
  "slen" integer,
  "sourcedb" varchar,
  "strain" varchar,
  "strand" varchar,
  "subname" varchar,
  "subtype" varchar,
  "taxid" integer,
  "tech" varchar,
  "term" varchar,
  "title" varchar,
  "topology" varchar,
  "uid" varchar,
  "updatedate" varchar
)
;
CREATE INDEX IF NOT EXISTS ix_esummseq_accessionversion ON "esummseq" ("accessionversion" ASC)
;
------------------------------------------------------------------------------
COMMIT TRANSACTION
;
------------------------------------------------------------------------------
-- DROP TABLE IF EXISTS assoc_esummseq_search_results
-- ;
CREATE TABLE IF NOT EXISTS "assoc_esummseq_search_results" (
  "id" varchar NOT NULL,
  "record_id" varchar NOT NULL,
  PRIMARY KEY ("id", "record_id"),
  FOREIGN KEY (record_id) REFERENCES "esummseq" (accessionversion) ON DELETE CASCADE
  -- FOREIGN KEY (id) REFERENCES "collections.search_results" (id)
)
;
CREATE INDEX IF NOT EXISTS ix_assoc_esummseq_search_results_id ON "assoc_esummseq_search_results" ("id" ASC)
;
CREATE INDEX IF NOT EXISTS ix_assoc_esummseq_search_results_record_id ON "assoc_esummseq_search_results" ("record_id" ASC)
;
----------------------------------------------------------------------------
-- DROP VIEW IF EXISTS esummseq_search_results
-- ;
-- @block create esummseq_search_results view
-- @conn seqrecs
CREATE VIEW IF NOT EXISTS esummseq_search_results AS
SELECT
  *
FROM
  assoc_esummseq_search_results
  INNER JOIN esummseq ON esummseq.accessionversion = assoc_esummseq_search_results.record_id
;
----------------------------------------------------------------------------
-- @block drop fts_esummseq virtual table
-- @conn summaries
-- DROP TABLE IF EXISTS fts_esummseq
-- ;
-- @block create fts_esummseq virtual table from esummseq
-- @conn summaries
CREATE VIRTUAL TABLE IF NOT EXISTS fts_esummseq USING fts5 (
  "accessionversion",
  "title",
  "moltype",
  content = "esummseq",
  content_rowid = "rowid"
)
;
-- @block fts_esummseq triggers
-- @conn summaries
CREATE TRIGGER IF NOT EXISTS fts_esummseq_i AFTER INSERT ON esummseq BEGIN
INSERT INTO
  fts_esummseq (
    "accessionversion",
    "title",
    "moltype"
  )
VALUES
  (
    new."accessionversion",
    new."title",
    new."moltype"
  )
;
END
;
CREATE TRIGGER IF NOT EXISTS fts_esummseq_d AFTER DELETE ON esummseq BEGIN
INSERT INTO
  fts_esummseq (
    fts_esummseq,
    "accessionversion",
    "title",
    "moltype"
  )
VALUES
  (
    "delete",
    old."accessionversion",
    old."title",
    old."moltype"
  )
;
END
;
CREATE TRIGGER IF NOT EXISTS fts_esummseq_u AFTER
UPDATE ON esummseq BEGIN
INSERT INTO
  fts_esummseq (
    fts_esummseq,
    "accessionversion",
    "title",
    "moltype"
  )
VALUES
  (
    "delete",
    old."accessionversion",
    old."title",
    old."moltype"
  )
;
INSERT INTO
  fts_esummseq (
    "accessionversion",
    "title",
    "moltype"
  )
VALUES
  (
    new."accessionversion",
    new."title",
    new."moltype"
  )
;
END
;
------------------------------------------------------------------------------
