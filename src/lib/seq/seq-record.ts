import type { Seq } from './seq'

export class SeqRecord {
  protected _id: string
  protected _seq: Seq

  constructor(id: string, seq: Seq) {
    this._seq = seq
    this._id = id
  }

  public get id(): string {
    return this._id
  }

  public get seq(): Seq {
    return this._seq
  }

  // public set id(id: string) {
  //   this._id = id
  // }

  // public set seq(seq: Seq) {
  //   this._seq = seq
  // }
}
