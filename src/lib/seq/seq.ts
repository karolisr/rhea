import { type SeqType } from '.'

export abstract class Seq {
  protected _str: string
  protected _gcId: number

  constructor(str: string, geneticCodeId: number = 1) {
    this._str = str
    this._gcId = geneticCodeId
  }

  public get str(): string {
    return this._str
  }

  public set str(str: string) {
    this._str = str
  }

  public get length(): number {
    return this._str.length
  }
}

export class AASeq extends Seq {
  public get type(): keyof typeof SeqType {
    return 'AA'
  }
}

export class NTSeq extends Seq {
  public get type(): keyof typeof SeqType {
    return 'NT'
  }
}

export class DNASeq extends NTSeq {
  public get type(): keyof typeof SeqType {
    return 'DNA'
  }
}

export class RNASeq extends NTSeq {
  public get type(): keyof typeof SeqType {
    return 'RNA'
  }
}
