import type { SeqType, Seq } from './types'

abstract class _Seq {
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

export function mkSeq(
  str: string,
  type: keyof typeof SeqType,
  geneticCodeId: number = 1
): Seq {
  switch (type) {
    case 'AA':
      return new AASeq(str, geneticCodeId)
    case 'NT':
      return new NTSeq(str, geneticCodeId)
    case 'DNA':
      return new DNASeq(str, geneticCodeId)
    case 'RNA':
      return new RNASeq(str, geneticCodeId)
  }
}

export class AASeq extends _Seq {
  constructor(str: string, geneticCodeId: number = 1) {
    super(str, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'AA'
  }
}

export class NTSeq extends _Seq {
  constructor(str: string, geneticCodeId: number = 1) {
    super(str, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'NT'
  }
}

export class DNASeq extends NTSeq {
  constructor(str: string, geneticCodeId: number = 1) {
    super(str, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'DNA'
  }
}

export class RNASeq extends NTSeq {
  constructor(str: string, geneticCodeId: number = 1) {
    str = str.replaceAll('T', 'U')
    str = str.replaceAll('t', 'u')
    super(str, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'RNA'
  }
}
