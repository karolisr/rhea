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
-- DROP TABLE IF EXISTS gb_sequences
-- ;
CREATE TABLE IF NOT EXISTS "gb_sequences" (
  "accession_version" varchar PRIMARY KEY NOT NULL,
  "sequence" varchar NOT NULL
  -- FOREIGN KEY (accession_version) REFERENCES "gb_records" (accession_version)
)
;
------------------------------------------------------------------------------
COMMIT TRANSACTION
;
------------------------------------------------------------------------------
