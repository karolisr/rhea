abstract class _Seq {
  protected _seq: string
  protected _gc_id: number

  constructor(seq: string, genetic_code_id: number) {
    this._seq = seq
    this._gc_id = genetic_code_id
  }

  get length(): number {
    return this._seq.length
  }
}

export class AASeq extends _Seq {
  constructor(seq: string, genetic_code_id: number) {
    super(seq, genetic_code_id)
  }
}

export class NTSeq extends _Seq {
  constructor(seq: string, genetic_code_id: number) {
    super(seq, genetic_code_id)
  }
}

export class DNASeq extends NTSeq {
  constructor(seq: string, genetic_code_id: number) {
    super(seq, genetic_code_id)
  }
}

export class RNASeq extends NTSeq {
  constructor(seq: string, genetic_code_id: number) {
    super(seq, genetic_code_id)
  }
}
