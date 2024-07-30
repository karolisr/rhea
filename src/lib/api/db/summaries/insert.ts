import sql, { bulk, empty } from 'sql-template-tag'
import {
  DB,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
} from '$lib/api/db'
import type { Databases } from '$lib/svelte-stores/databases'
import type { ESummaryNuccore } from '$lib/ncbi'

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
