#!/usr/bin/env bash

TAXONOMY="./src/lib/app/api/db/schema/taxonomy"
TAXONOMY_SQL="${TAXONOMY}.sql"
TAXONOMY_TS="${TAXONOMY}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaTaxonomy = sql\`"
    cat "${TAXONOMY_SQL}"
    echo "\`"
} > ${TAXONOMY_TS}

SECRECS="./src/lib/app/api/db/schema/seqrecs"
SECRECS_SQL="${SECRECS}.sql"
SECRECS_TS="${SECRECS}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaSeqRecs = sql\`"
    cat "${SECRECS_SQL}"
    echo "\`"
} > ${SECRECS_TS}

SEQUENCES="./src/lib/app/api/db/schema/sequences"
SEQUENCES_SQL="${SEQUENCES}.sql"
SEQUENCES_TS="${SEQUENCES}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaSequences = sql\`"
    cat "${SEQUENCES_SQL}"
    echo "\`"
} > ${SEQUENCES_TS}

COLLECTIONS="./src/lib/app/api/db/schema/collections"
COLLECTIONS_SQL="${COLLECTIONS}.sql"
COLLECTIONS_TS="${COLLECTIONS}.ts"

{   echo "import sql from 'sql-template-tag'"
    echo
    echo "export const schemaCollections = sql\`"
    cat "${COLLECTIONS_SQL}"
    echo "\`"
} > ${COLLECTIONS_TS}
