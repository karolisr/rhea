import type { IndexedUndefined } from '$lib/types'
import type { Seq, SeqRecordId } from './types'

export class SeqRecord {
  protected _data: IndexedUndefined

  protected _id: SeqRecordId
  protected _seq: Seq

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

  public get data(): IndexedUndefined {
    return this._data
  }
}
