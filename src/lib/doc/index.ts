import type { IndexedUndefined } from '$lib/types'
import { SeqRecord } from '$lib/seq/seq-record'

abstract class _Doc {
  protected _data: IndexedUndefined

  protected _id: string
  protected _type: string
  protected _name: string = ''
  protected _description: string = ''
  protected _organism: string = ''

  protected _length: number = 0
  protected _nSeq: number = 0

  constructor(
    data: IndexedUndefined,
    id: string,
    type: string,
    name: string,
    description: string,
    organism: string
  ) {
    this._id = id
    this._type = type
    this._name = name
    this._description = description
    this._organism = organism
    this._data = data
  }

  public get data(): IndexedUndefined {
    return this._data
  }

  public get id(): string {
    return this._id
  }

  public get type(): string {
    return this._type
  }

  public get name(): string {
    return this._name
  }

  public get description(): string {
    return this._description
  }

  public get organism(): string {
    return this._organism
  }

  public get length(): number {
    return this._length
  }

  public get nSeq(): number {
    return this._nSeq
  }
}

export class Doc extends _Doc {
  constructor(
    data: IndexedUndefined,
    id: string,
    type: string,
    name: string = '',
    description: string = '',
    organism: string = ''
  ) {
    super(data, id, type, name, description, organism)
  }
}

export class SeqRecordDoc extends Doc {
  constructor(seqRecord: SeqRecord) {
    super(seqRecord.data, seqRecord.id, seqRecord.seq.type)
    this._length = seqRecord.seq.length
    this._nSeq = 1
  }
}
