import sql, { bulk, empty } from 'sql-template-tag'
import type { Databases } from '$lib/stores/databases'

import {
  DB,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
} from '$lib/backend/db'

import type { IndexedUndefined } from '$lib/types'
import type { ESummaryNuccore } from '$lib/ncbi'

export async function getAllSeqSummaries(
  dbs: Databases,
  dbName: 'dbSummaries' = 'dbSummaries',
  tableName: 'esummseq_search_results' = 'esummseq_search_results'
) {
  let db: DB | null = dbs[dbName]
  let rv: IndexedUndefined[] = []
  if (db !== null) {
    const _sql = sql`
      SELECT
        *
      FROM
        "table_name"
      ;
    `
    rv = await db.select(
      _sql.text.replace('table_name', tableName),
      _sql.values
    )
  }
  return rv
}

export async function getSeqSummariesForCollections(
  collectionIds: string[],
  dbs: Databases,
  dbName: 'dbSummaries' = 'dbSummaries',
  tableName: 'esummseq_search_results' = 'esummseq_search_results'
): Promise<Set<string>> {
  let db: DB | null = dbs[dbName]
  let _rv: IndexedUndefined[] = []
  if (db !== null && collectionIds.length > 0) {
    const _sql = sql`
      SELECT
        "accessionversion"
      FROM
        "table_name"
      WHERE
        "id" IN ${bulk([collectionIds])}
      ;
    `
    _rv = await db.select(
      _sql.text.replace('table_name', tableName),
      _sql.values
    )
  }
  return new Set<string>(_rv.map((v) => v['accessionversion'] as string))
}

export async function deleteSeqSummaries(
  ids: string[],
  dbs: Databases,
  dbName: 'dbSummaries' = 'dbSummaries',
  tableName: 'esummseq' = 'esummseq'
) {
  let db: DB | null = dbs[dbName]
  if (db !== null && ids.length > 0) {
    const _sql = sql`
      DELETE FROM "table_name"
      WHERE
        "accessionversion" IN ${bulk([ids])}
      ;
    `
    await db.execute(_sql.text.replace('table_name', tableName), _sql.values)
  }
}

export async function insertSeqSummaries(
  records: ESummaryNuccore[],
  dbs: Databases,
  dbName: 'dbSummaries' = 'dbSummaries'
) {
  let db: DB | null = dbs[dbName]
  if (db !== null) {
    const vals = []
    try {
      for (let i = 0; i < records.length; i++) {
        const r = records[i]
        vals.push([
          r.accessionversion,
          r.assemblyacc,
          r.assemblygi,
          r.biomol,
          r.biosample,
          r.caption,
          r.completeness,
          r.createdate,
          r.extra,
          r.flags,
          r.geneticcode,
          r.genome,
          r.gi,
          r.moltype,
          r.organism,
          r.projectid,
          r.segsetsize,
          r.slen,
          r.sourcedb,
          r.strain,
          r.strand,
          r.subname,
          r.subtype,
          r.taxid,
          r.tech,
          r.term,
          r.title,
          r.topology,
          r.uid,
          r.updatedate
        ])
      }
      const _sql = _seqsumm(vals)
      await beginTransaction(db)
      await db.execute(_sql.text, _sql.values)
      await commitTransaction(db)
    } catch (error) {
      await rollbackTransaction(db)
      console.error('Error in insertSeqSummaries:', error)
    }
  }
}

function _seqsumm(values: (string | number | undefined)[][]) {
  if (values.length === 0) return empty
  return sql`
    INSERT INTO
      esummseq (
        "accessionversion",
        "assemblyacc",
        "assemblygi",
        "biomol",
        "biosample",
        "caption",
        "completeness",
        "createdate",
        "extra",
        "flags",
        "geneticcode",
        "genome",
        "gi",
        "moltype",
        "organism",
        "projectid",
        "segsetsize",
        "slen",
        "sourcedb",
        "strain",
        "strand",
        "subname",
        "subtype",
        "taxid",
        "tech",
        "term",
        "title",
        "topology",
        "uid",
        "updatedate"
      )
    VALUES
      ${bulk(values)}
    ON CONFLICT ("accessionversion") DO NOTHING
    ;
  `
}
