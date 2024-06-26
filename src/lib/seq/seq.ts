abstract class _Seq {
  protected _seq: string
  protected _gcId: number

  constructor(seq: string, geneticCodeId: number = 1) {
    this._seq = seq
    this._gcId = geneticCodeId
  }

  get str(): string {
    return this._seq
  }

  get length(): number {
    return this._seq.length
  }
}

export class AASeq extends _Seq {
  constructor(seq: string, geneticCodeId: number = 1) {
    super(seq, geneticCodeId)
  }
}

export class NTSeq extends _Seq {
  constructor(seq: string, geneticCodeId: number = 1) {
    super(seq, geneticCodeId)
  }
}

export class DNASeq extends NTSeq {
  constructor(seq: string, geneticCodeId: number = 1) {
    super(seq, geneticCodeId)
  }
}

export class RNASeq extends NTSeq {
  constructor(seq: string, geneticCodeId: number = 1) {
    seq = seq.replaceAll('T', 'U')
    seq = seq.replaceAll('t', 'u')
    super(seq, geneticCodeId)
  }
}
