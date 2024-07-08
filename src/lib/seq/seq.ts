import type { SeqType } from './types'

abstract class _Seq {
  protected _seq: string
  protected _gcId: number

  constructor(seq: string, geneticCodeId: number = 1) {
    this._seq = seq
    this._gcId = geneticCodeId
  }

  public get str(): string {
    return this._seq
  }

  public get length(): number {
    return this._seq.length
  }
}

export class AASeq extends _Seq {
  constructor(seq: string, geneticCodeId: number = 1) {
    super(seq, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'AA'
  }
}

export class NTSeq extends _Seq {
  constructor(seq: string, geneticCodeId: number = 1) {
    super(seq, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'NT'
  }
}

export class DNASeq extends NTSeq {
  constructor(seq: string, geneticCodeId: number = 1) {
    super(seq, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'DNA'
  }
}

export class RNASeq extends NTSeq {
  constructor(seq: string, geneticCodeId: number = 1) {
    seq = seq.replaceAll('T', 'U')
    seq = seq.replaceAll('t', 'u')
    super(seq, geneticCodeId)
  }

  public get type(): keyof typeof SeqType {
    return 'RNA'
  }
}
