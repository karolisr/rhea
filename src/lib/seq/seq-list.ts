import { SeqRecord } from '$lib/seq/seq-record'
import { type SeqType } from '.'
import { parseFastaStr } from './fasta'
import { min, max } from '$lib'

export type Position = { col: number; row: number }

export class SeqList {
  public seqRecs: SeqRecord[]
  public type: keyof typeof SeqType
  public nCol: number

  constructor(seqRecs: SeqRecord[]) {
    this.seqRecs = seqRecs
    this.type = 'NT'

    if (seqRecs.length > 0) {
      this.type = seqRecs[0].seq.type
    }

    this.nCol = this.calcNCol()
  }

  static fromFasta(
    fastaStr: string,
    type: keyof typeof SeqType = 'NT',
    geneticCodeId: number = 1
  ): SeqList {
    return new SeqList(parseFastaStr(fastaStr, type, geneticCodeId))
  }

  public insert(char: string, col: number, rows: number[]) {
    for (let i = 0; i < this.seqRecs.length; i++) {
      const sr = this.seqRecs[i]
      let left = sr.seq.str.slice(0, col)
      let right = sr.seq.str.slice(col, sr.seq.length)
      if (rows.includes(i)) {
        sr.seq.str = left + char + right
      } else {
        sr.seq.str = left + right + '-'
      }
    }
    this.nCol = this.calcNCol()
  }

  public delete(left: number, right: number, rows: number[]) {
    for (let i = 0; i < this.seqRecs.length; i++) {
      const sr = this.seqRecs[i]
      let ls = sr.seq.str.slice(0, left)
      let rs = sr.seq.str.slice(right, sr.seq.length)
      if (rows.includes(i)) {
        sr.seq.str = ls + rs + '-'.repeat(right - left)
      }
    }
    this.nCol = this.calcNCol()
  }

  public slice(
    left: number = 0,
    right: number = this.nCol,
    top: number = 0,
    bottom: number = this.nRow
  ): string[][] {
    const sliced: string[][] = []
    for (let i = max(top, 0); i < min(bottom, this.nRow); i++) {
      const sr = this.seqRecs[i]
      sliced.push([
        sr.id,
        sr.seq.type,
        sr.seq.str.slice(max(left, 0), min(right, sr.seq.length))
      ])
    }
    return sliced
  }

  public get nRow(): number {
    return this.seqRecs.length
  }

  protected calcNColMinMax(): { minL: number; maxL: number } {
    const lengths = []
    for (let i = 0; i < this.seqRecs.length; i++) {
      const sr = this.seqRecs[i]
      lengths.push(sr.seq.length)
    }
    if (lengths.length > 0) {
      const minL = min(...lengths)
      const maxL = max(...lengths)
      return { minL, maxL }
    } else {
      return { minL: 0, maxL: 0 }
    }
  }

  protected calcNCol(): number {
    const _ = this.calcNColMinMax()
    return _.maxL
  }
}
