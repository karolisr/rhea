import type { IndexedUndefined } from '$lib/types'
import { SeqRecord } from '$lib/seq/seq-record'
import { Alignment } from '$lib/seq/aln'

abstract class _Doc {
  protected _data: unknown

  protected _id: string
  protected _type: string
  protected _name: string = ''
  protected _description: string = ''
  protected _organism: string = ''

  protected _length: number = 0
  protected _nSeq: number = 0

  constructor(
    data: unknown,
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

  public get data(): unknown {
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
    data: unknown,
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
  protected declare _data: SeqRecord

  constructor(seqRecord: SeqRecord) {
    super(seqRecord, seqRecord.id, seqRecord.seq.type)
    this._nSeq = 1
  }

  public get data(): SeqRecord {
    return this._data
  }

  public get length(): number {
    return this._data.seq.length
  }
}

export class AlignmentDoc extends Doc {
  protected declare _data: Alignment

  constructor(alignment: Alignment, id: string) {
    super(alignment, id, alignment.type)
  }

  public get data(): Alignment {
    return this._data
  }

  public get length(): number {
    return this._data.nCol
  }

  public get nSeq(): number {
    return this._data.nRow
  }
}
