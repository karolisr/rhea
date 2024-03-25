import type { DBSchema } from 'idb'
import type { ESummaryNuccore } from '$lib/ncbi'
import type { GBSeq } from '$lib/ncbi/types/GBSet'
import type { Taxon, TaxId } from '$lib/ncbi/types/TaxaSet'

export interface DBMain extends DBSchema {
  seq_nt_summ: {
    key: ESummaryNuccore['accessionversion']
    value: ESummaryNuccore
    indexes: { TaxId: TaxId; genome: string; sourcedb: string }
  }

  taxon: {
    key: Taxon['TaxId']
    value: Taxon
    indexes: {
      Division: string
      GCId: string
      MGCId: string
      ParentTaxId: TaxId
      Rank: string
    }
  }

  gbseq: {
    key: GBSeq['GBSeq_accession_version']
    value: GBSeq
  }
}
