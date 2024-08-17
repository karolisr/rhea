#!/usr/bin/env bash

SCHEMA_DIR="./src/lib/backend/db/schema"

TAXONOMY="${SCHEMA_DIR}/taxonomy"
TAXONOMY_SQL="${TAXONOMY}.sql"
TAXONOMY_TS="${TAXONOMY}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaTaxonomy = sql\`"
    cat "${TAXONOMY_SQL}"
    echo "\`"
} > ${TAXONOMY_TS}

SUMMARIES="${SCHEMA_DIR}/summaries"
SUMMARIES_SQL="${SUMMARIES}.sql"
SUMMARIES_TS="${SUMMARIES}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaSummaries = sql\`"
    cat "${SUMMARIES_SQL}"
    echo "\`"
} > ${SUMMARIES_TS}

SECRECS="${SCHEMA_DIR}/seqrecs"
SECRECS_SQL="${SECRECS}.sql"
SECRECS_TS="${SECRECS}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaSeqRecs = sql\`"
    cat "${SECRECS_SQL}"
    echo "\`"
} > ${SECRECS_TS}

SEQUENCES="${SCHEMA_DIR}/sequences"
SEQUENCES_SQL="${SEQUENCES}.sql"
SEQUENCES_TS="${SEQUENCES}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaSequences = sql\`"
    cat "${SEQUENCES_SQL}"
    echo "\`"
} > ${SEQUENCES_TS}

COLLECTIONS="${SCHEMA_DIR}/collections"
COLLECTIONS_SQL="${COLLECTIONS}.sql"
COLLECTIONS_TS="${COLLECTIONS}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaCollections = sql\`"
    cat "${COLLECTIONS_SQL}"
    echo "\`"
} > ${COLLECTIONS_TS}
