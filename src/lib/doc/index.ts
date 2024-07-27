import { SeqRecord } from '$lib/seq/seq-record'
import { Alignment } from '$lib/seq/aln'

export type DocField = keyof Doc

export abstract class Doc {
  protected __data: unknown = null
  protected _uid: string
  protected _id: string
  protected _moltype: string = ''
  protected _definition: string = ''

  constructor(uid: string, id: string, definition: string, moltype: string) {
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

  public get moltype(): string {
    return this._moltype
  }
}

export abstract class SeqRecordDoc extends Doc {
  protected declare __data: SeqRecord | null
}

export class SeqRecordDocGenBank extends SeqRecordDoc {}
export class SeqRecordDocUser extends SeqRecordDoc {}

export class AlignmentDoc extends Doc {
  protected declare __data: Alignment | null
}
