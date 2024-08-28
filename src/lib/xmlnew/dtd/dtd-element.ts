export { getDtdElements }

import { getDtdTags } from './dtd-common'
import { cleanContent } from './utils'

interface DtdElement {
  name: string
  content: string
}

// <!ELEMENT element-name content-model>
// content-model:
//    EMPTY | ANY | #PCDATA | P1, P2 | P1 | P2 | P1? | P1+ | P1* | (P)
//    P1 , P2 concatenation
//    P1 | P2 disjunction
//    P?      optional
//    P+      one or more occurrences
//    P*      the Kleene closure
//    (P)     grouping
// mixed-content:
//    (#PCDATA | element-name | ...)*

function getDtdElementTags(txt: string): string[] {
  return getDtdTags(txt, 'element')
}

function parseDtdElementTag(txt: string): DtdElement | undefined {
  const en: string = /(?:(?<n>\S+)\s+)/.source
  const ec: string = /(?<c>.+)/.source
  const re: RegExp = RegExp(`${en}${ec}`, 'gs')

  const _ = [...txt.matchAll(re)].map((_) => _.groups)[0]
  if (_ !== undefined) {
    const c = cleanContent(_.c, ['|', ',', '(', ')'])
    return { name: _.n, content: c }
  } else {
    return undefined
  }
}

function getDtdElements(txt: string): Array<DtdElement> {
  const elementTags = getDtdElementTags(txt)
  const elements = elementTags
    .map((_) => parseDtdElementTag(_))
    .filter((_) => _ !== undefined)
  return elements
}
