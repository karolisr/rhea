import { SeqRecord } from '$lib/seq/seq-record'
import { Alignment } from '$lib/seq/aln'
import { type SeqType } from '$lib/seq/index'

export type DocField = keyof Doc

export abstract class Doc {
  protected __data: unknown = null
  protected _uid: string
  protected _id: string
  protected _moltype: keyof typeof SeqType = 'UNKNOWN'
  protected _definition: string = ''

  constructor(
    uid: string,
    id: string,
    definition: string,
    moltype: keyof typeof SeqType
  ) {
    this._uid = uid
    this._id = id
    this._definition = definition
    this._moltype = moltype
  }

  public get fields(): string[] {
    const keys = Object.keys(this).map((_) => _.replace('_', ''))
    return keys.filter((_) => !_.startsWith('_'))
  }

  public get uid(): string {
    return this._uid
  }

  public get id(): string {
    return this._id
  }

  public get definition(): string {
    return this._definition
  }

  public get moltype(): keyof typeof SeqType {
    return this._moltype
  }

  public set data(data: unknown) {
    this.__data = data
  }

  public get data(): unknown {
    return this.__data
  }
}

export abstract class SeqRecordDoc extends Doc {
  protected declare __data: SeqRecord | null

  public set data(data: SeqRecord | null) {
    this.__data = data
  }

  public get data(): SeqRecord | null {
    return this.__data
  }
}

export class SeqRecordDocGenBank extends SeqRecordDoc {}
export class SeqRecordDocUser extends SeqRecordDoc {}

export class AlignmentDoc extends Doc {
  protected declare __data: Alignment | null

  public set data(data: Alignment | null) {
    this.__data = data
  }

  public get data(): Alignment | null {
    return this.__data
  }
}
