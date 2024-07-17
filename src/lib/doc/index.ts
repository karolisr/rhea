import { SeqRecord } from '$lib/seq/seq-record'
import { Alignment } from '$lib/seq/aln'

export type Doc = SeqRecordDoc | AlignmentDoc

abstract class _Doc {
  protected _data: unknown
  protected _id: string
  protected _type: string = '_DocType'
  protected _name: string = '_DocName'
  protected _description: string = '_DocDescription'
  protected _organism: string = '_DocOrganism'
  protected _length: number = 0
  protected _nSeq: number = 0

  constructor(
    data: unknown,
    id: string,
    type: string = '_DocType',
    name: string = '_DocName',
    description: string = '_DocDescription',
    organism: string = '_DocOrganism'
  ) {
    this._data = data
    this._id = id
    this._type = type
    this._name = name
    this._description = description
    this._organism = organism
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

export class SeqRecordDoc extends _Doc {
  protected declare _data: SeqRecord

  constructor(seqRecord: SeqRecord) {
    super(seqRecord, seqRecord.id)
    this._nSeq = 1
  }

  public get data(): SeqRecord {
    return this._data
  }

  public get type(): string {
    return this._data.seq.type
  }

  public get length(): number {
    return this._data.seq.length
  }
}

export class AlignmentDoc extends _Doc {
  protected declare _data: Alignment

  constructor(alignment: Alignment, id: string) {
    super(alignment, id)
  }

  public get data(): Alignment {
    return this._data
  }

  public get type(): string {
    return this._data.type
  }

  public get length(): number {
    return this._data.nCol
  }

  public get nSeq(): number {
    return this._data.nRow
  }
}
