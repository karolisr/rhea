------------------------------------------------------------------------------
DROP TABLE IF EXISTS "user"
;
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
  user (
    "parent_id",
    "id",
    "label",
    "notes"
  )
VALUES
  (NULL, "ROOT", "ROOT", ""),
  (
    "ROOT",
    "FIXED_ALL_RECORDS",
    "All Records",
    ""
  )
ON CONFLICT ("id") DO NOTHING
;
------------------------------------------------------------------------------
DROP TABLE IF EXISTS "search_results"
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
INSERT INTO
  search_results (
    "parent_id",
    "id",
    "label",
    "notes"
  )
VALUES
  (NULL, "ROOT", "ROOT", "")
ON CONFLICT ("id") DO NOTHING
;
------------------------------------------------------------------------------
DROP TABLE IF EXISTS "cat_moltype"
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "cat_moltype" (
  "parent_id" varchar,
  "id" varchar PRIMARY KEY NOT NULL,
  "label" varchar NOT NULL,
  "notes" varchar,
  FOREIGN KEY (parent_id) REFERENCES "cat_moltype" (id) ON DELETE CASCADE
)
;
INSERT INTO
  cat_moltype (
    "parent_id",
    "id",
    "label",
    "notes"
  )
VALUES
  (NULL, "ROOT", "ROOT", ""),
  ("ROOT", "AA", "AA", ""),
  ("ROOT", "NT", "NT", ""),
  ("NT", "DNA", "DNA", ""),
  ("NT", "RNA", "RNA", ""),
  (
    "RNA",
    "cRNA",
    "cRNA",
    ""
  ),
  (
    "RNA",
    "lncRNA",
    "lncRNA",
    ""
  ),
  (
    "RNA",
    "mRNA",
    "mRNA",
    ""
  ),
  (
    "RNA",
    "miRNA",
    "miRNA",
    ""
  ),
  (
    "RNA",
    "ncRNA",
    "ncRNA",
    ""
  ),
  (
    "RNA",
    "rRNA",
    "rRNA",
    ""
  ),
  (
    "RNA",
    "snRNA",
    "snRNA",
    ""
  ),
  (
    "RNA",
    "tRNA",
    "tRNA",
    ""
  ),
  (
    "RNA",
    "transcribed-RNA",
    "transcribed-RNA",
    ""
  )
ON CONFLICT ("id") DO NOTHING
;
------------------------------------------------------------------------------
DROP TABLE IF EXISTS "cat_organelle"
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "cat_organelle" (
  "parent_id" varchar,
  "id" varchar PRIMARY KEY NOT NULL,
  "label" varchar NOT NULL,
  "notes" varchar,
  FOREIGN KEY (parent_id) REFERENCES "cat_organelle" (id) ON DELETE CASCADE
)
;
INSERT INTO
  cat_organelle (
    "parent_id",
    "id",
    "label",
    "notes"
  )
VALUES
  (NULL, "ROOT", "ROOT", ""),
  (
    "ROOT",
    "nucbac",
    "Nuclear/Bacterial",
    ""
  ),
  (
    "ROOT",
    "organelle",
    "Organelle",
    ""
  ),
  (
    "organelle",
    "plastid",
    "Plastid",
    ""
  ),
  (
    "organelle",
    "mitochondrion",
    "Mitochondrion",
    ""
  ),
  (
    "plastid",
    "chloroplast",
    "Chloroplast",
    ""
  ),
  (
    "plastid",
    "apicoplast",
    "Apicoplast",
    ""
  )
ON CONFLICT ("id") DO NOTHING
;
------------------------------------------------------------------------------
DROP TABLE IF EXISTS "cat_other"
;
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "cat_other" (
  "parent_id" varchar,
  "id" varchar PRIMARY KEY NOT NULL,
  "label" varchar NOT NULL,
  "notes" varchar,
  FOREIGN KEY (parent_id) REFERENCES "cat_other" (id) ON DELETE CASCADE
)
;
INSERT INTO
  cat_other (
    "parent_id",
    "id",
    "label",
    "notes"
  )
VALUES
  (NULL, "ROOT", "ROOT", ""),
  (
    "ROOT",
    "plasmid",
    "Plasmid",
    ""
  )
ON CONFLICT ("id") DO NOTHING
;
------------------------------------------------------------------------------
