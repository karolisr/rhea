import { AA_ONLY_CHARS } from './iupac'
import { Seq, AASeq, NTSeq, DNASeq, RNASeq } from './seq'

export type Position = { col: number; row: number }

export enum SeqType {
  'AA',
  'NT',
  'RNA',
  'DNA',
  'UNKNOWN'
}

export function mkSeq(
  str: string,
  type: keyof typeof SeqType | 'auto' = 'auto',
  geneticCodeId: number = 1
): Seq {
  if (type === 'auto') {
    type = detectSeqType(str)
  }

  switch (type) {
    case 'AA':
      return new AASeq(str, geneticCodeId)
    case 'NT':
      return new NTSeq(str, geneticCodeId)
    case 'DNA':
      return new DNASeq(str, geneticCodeId)
    case 'RNA':
      return new RNASeq(str, geneticCodeId)
    case 'UNKNOWN':
      throw new Error('Cannot determine sequence type.')
  }
}

export function detectSeqType(str: string): keyof typeof SeqType {
  const fastaChars = new Set(str)
  fastaChars.delete('-')
  fastaChars.delete('.')

  let seqType: keyof typeof SeqType = 'UNKNOWN'

  if (fastaChars.intersection(AA_ONLY_CHARS).size !== 0) {
    seqType = 'AA'
  } else if (fastaChars.has('T') && fastaChars.has('U')) {
    seqType = 'NT'
  } else if (fastaChars.has('T')) {
    seqType = 'DNA'
  } else if (fastaChars.has('U')) {
    seqType = 'RNA'
  } else {
    seqType = 'UNKNOWN'
  }
  return seqType
}
