import type { SeqRecord } from './seq-record'

// export type GenomeMap ...
export type Contig = SeqRecord[]
export type Contigs = { [genomePartName: string]: Contig[] }

export class Genome {
  protected _parts: Contigs | undefined
  protected _taxid: number | undefined

  constructor() {
    this._parts = {}
    this._taxid = undefined
  }
}
