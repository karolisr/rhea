import type { Seq, SeqRecordId } from './types'

export class SeqRecord {
  protected _data: object
  protected _seq: Seq
  protected _id: SeqRecordId

  constructor(id: SeqRecordId, seq: Seq) {
    this._data = {}
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
