import { type SeqType } from '.'
import { SeqRecord } from './seq-record'
import { SeqList } from './seq-list'
import { parseFastaStr } from './fasta'

export class Alignment extends SeqList {
  constructor(seqRecs: SeqRecord[]) {
    super(seqRecs)
  }

  static fromFasta(
    fastaStr: string,
    type: keyof typeof SeqType | 'auto' = 'auto',
    geneticCodeId: number = 1
  ): Alignment {
    return new Alignment(parseFastaStr(fastaStr, type, geneticCodeId))
  }

  trimTrailingGaps() {
    const sliced = this.slice(this.nCol - 1)
    const same = sliced.every((v) => v[2] === '-')
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
