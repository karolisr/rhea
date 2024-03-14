import type { DBSchema } from 'idb'
import type { ESummaryNuccore, ESummaryTaxonomy } from '$lib/ncbi'
import type { GBSeq } from '$lib/ncbi/types/gbseq'

export interface DBMain extends DBSchema {
  seq_nt_summ: {
    key: ESummaryNuccore['accessionversion']
    value: ESummaryNuccore
    indexes: { taxid: ESummaryNuccore['taxid'] }
  }

  tax_summ: {
    key: ESummaryTaxonomy['taxid']
    value: ESummaryTaxonomy
  }

  gbseq: {
    key: GBSeq['GBSeq_accession_version']
    value: GBSeq
  }
}

export interface DBRaw extends DBSchema {
  gbseq_xml: {
    key: string
    value: string
  }
}
