import { SeqType } from '$lib/seq/types'
import { mkSeq } from '$lib/seq/seq'
import { SeqRecord } from '$lib/seq/seq-record'

export function parse_fasta_txt(
  fastaStr: string,
  type: keyof typeof SeqType = 'NT',
  geneticCodeId: number = 1
): SeqRecord[] {
  const lSeqRecs: SeqRecord[] = []
  const lines = fastaStr.split('\n')
  let def = ''
  let str = ''
  lines.forEach((l) => {
    if (l[0] == '>') {
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
