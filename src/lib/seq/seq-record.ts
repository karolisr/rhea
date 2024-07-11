import type { Seq, SeqRecordId } from './types'

export class SeqRecord {
  protected _id: SeqRecordId
  protected _seq: Seq

  constructor(id: SeqRecordId, seq: Seq) {
    this._seq = seq
    this._id = id
  }

  public get id(): string {
    return this._id
  }

  public get seq(): Seq {
    return this._seq
  }
}
