import type { DBSchema } from 'idb'
import type { ESummaryNuccore, ESummaryTaxonomy } from '$lib/ncbi'
import type { GBSeq } from '$lib/ncbi/types/gbseq'

export interface DBMain extends DBSchema {
  seq_nt_summ: {
    key: string
    value: ESummaryNuccore
  }

  tax_summ: {
    key: string
    value: ESummaryTaxonomy
  }

  gbseq: {
    key: string
    value: GBSeq
  }
}

export interface DBRaw extends DBSchema {
  gbseq_xml: {
    key: string
    value: string
  }
}
