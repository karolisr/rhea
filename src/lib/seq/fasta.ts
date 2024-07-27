import { type SeqType, mkSeq, detectSeqType } from '.'
import { SeqRecord } from './seq-record'
import { SeqList } from './seq-list'

export function detectFastaSeqType(fastaStr: string): keyof typeof SeqType {
  const lines = fastaStr.split('\n')
  let str = ''
  lines.forEach((l) => {
    if (l[0] !== '>') {
      str += l
    }
  })
  return detectSeqType(str)
}

export function parseFastaStr(
  fastaStr: string,
  type: keyof typeof SeqType | 'auto' = 'auto',
  geneticCodeId: number = 1
): SeqRecord[] {
  const lSeqRecs: SeqRecord[] = []
  const lines = fastaStr.split('\n')
  let def = ''
  let str = ''

  if (type === 'auto') {
    type = detectFastaSeqType(fastaStr)
  }

  lines.forEach((l) => {
    if (l[0] === '>') {
      if (str != '') {
        lSeqRecs.push(new SeqRecord(def, mkSeq(str, type, geneticCodeId)))
        str = ''
      }
      def = l.slice(1)
      def = def.split('||')[0] // ToDo: remove.
    } else if (def != '') {
      str += l
    }
  })
  lSeqRecs.push(new SeqRecord(def, mkSeq(str, type, geneticCodeId)))
  return lSeqRecs
}
