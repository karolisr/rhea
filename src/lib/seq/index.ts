import { SeqType } from '$lib/seq/types'
import { AA_ONLY_CHARS } from './iupac'

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
