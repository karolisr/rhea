import { AA_ONLY_CHARS } from './iupac'
import { Seq, AASeq, NTSeq, DNASeq, RNASeq } from './seq'

export enum SeqType {
  'AA',
  'NT',
  'RNA',
  'DNA'
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

export function detectSeqType(str: string): keyof typeof SeqType {
  const fastaChars = new Set(str)
  fastaChars.delete('-')
  fastaChars.delete('.')
  if (fastaChars.intersection(AA_ONLY_CHARS).size !== 0) {
    return 'AA'
  } else if (fastaChars.has('T') && fastaChars.has('U')) {
    return 'NT'
  } else if (fastaChars.has('T')) {
    return 'DNA'
  } else if (fastaChars.has('U')) {
    return 'RNA'
  } else {
    return 'NT'
  }
}
