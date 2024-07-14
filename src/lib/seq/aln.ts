import { SeqRecord } from '$lib/seq/seq-record'
import { SeqList } from './seq-list'
import { SeqType } from './types'
import { parse_fasta_txt } from './fasta'

export type Position = { col: number; row: number }

export class Alignment extends SeqList {
  constructor(seqRecs: SeqRecord[]) {
    super(seqRecs)
  }

  static fromFasta(
    fastaStr: string,
    type: keyof typeof SeqType = 'NT',
    geneticCodeId: number = 1
  ): Alignment {
    return new Alignment(parse_fasta_txt(fastaStr, type, geneticCodeId))
  }

  trimTrailingGaps() {
    const sliced = this.slice(this.nCol - 1)
    const same = sliced.every((v) => v == '-')
    if (same) {
      this.seqRecs.forEach((sr) => {
        sr.seq.str = sr.seq.str.slice(0, this.nCol - 1)
      })
      this.nCol = this.calcNCol()
      this.trimTrailingGaps()
    }
  }

  protected calcNCol(): number {
    const { minL, maxL } = this.calcNColMinMax()
    if (minL == maxL) {
      return maxL
    } else {
      throw new Error('Sequences in the alignment are not of the same length.')
    }
  }
}