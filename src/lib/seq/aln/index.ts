import { SeqRecord } from '$lib/seq/seq-record'
import { SeqType } from '../types'
import { parseFasta } from '../fasta'

export type Position = { col: number; row: number }

export class Alignment {
  seqRecs: SeqRecord[]
  type: keyof typeof SeqType
  nCol: number

  constructor(seqRecs: SeqRecord[]) {
    this.seqRecs = seqRecs
    this.type = 'NT'

    if (seqRecs.length > 0) {
      this.type = seqRecs[0].seq.type
    }

    this.nCol = this.#calcNCol()
  }

  static fromFasta(
    fastaStr: string,
    type: keyof typeof SeqType = 'NT',
    geneticCodeId: number = 1
  ): Alignment {
    return new Alignment(parseFasta(fastaStr, type, geneticCodeId))
  }

  trimTrailingGaps() {
    const sliced = this.slice(this.nCol - 1)
    const same = sliced.every((v) => v == '-')
    if (same) {
      this.seqRecs.forEach((sr) => {
        sr.seq.str = sr.seq.str.slice(0, this.nCol - 1)
      })
      this.nCol = this.#calcNCol()
      this.trimTrailingGaps()
    }
  }

  insert(char: string, col: number, rows: number[]) {
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
    this.nCol = this.#calcNCol()
  }

  delete(left: number, right: number, rows: number[]) {
    for (let i = 0; i < this.seqRecs.length; i++) {
      const sr = this.seqRecs[i]
      let ls = sr.seq.str.slice(0, left)
      let rs = sr.seq.str.slice(right, sr.seq.length)
      if (rows.includes(i)) {
        sr.seq.str = ls + rs + '-'.repeat(right - left)
      }
    }
    this.nCol = this.#calcNCol()
  }

  slice(
    left: number = 0,
    right: number = this.nCol,
    top: number = 0,
    bottom: number = this.nRow
  ): string[] {
    const sliced: string[] = []
    for (let i = Math.max(top, 0); i < Math.min(bottom, this.nRow); i++) {
      const sr = this.seqRecs[i]
      sliced.push(
        sr.seq.str.slice(Math.max(left, 0), Math.min(right, this.nCol))
      )
    }
    return sliced
  }

  get nRow(): number {
    return this.seqRecs.length
  }

  #calcNCol(): number {
    const lengths = []
    for (let i = 0; i < this.seqRecs.length; i++) {
      const sr = this.seqRecs[i]
      lengths.push(sr.seq.length)
    }
    const min_len = Math.min(...lengths)
    const max_len = Math.max(...lengths)
    if (min_len == max_len) {
      return min_len
    } else {
      throw new Error('Sequences in the alignment are not of the same length.')
    }
  }
}