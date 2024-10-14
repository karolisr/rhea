export { getDtdAttributes }

import { getDtdTags } from './dtd-common'
import { cleanContent } from './utils'

export interface DtdAtt {
  eleName?: string
  name: string
  type: string
  value: string
}

interface DtdAttType {
  [key: string]: string
}

const attValType: DtdAttType = {
  '(true|false)': 'BooleanT'
}

// <!ATTLIST element-name attr-name attr-type attr-default>
// <!ATTLIST element-name
//    attr-name attr-type "value"
//    attr-name attr-type #FIXED "value"
//    attr-name attr-type #REQUIRED
//    attr-name attr-type #IMPLIED>
//
// Attribute types:
//    CDATA, ID, IDREF, IDREFS, (true|false), ...
//
// <!ATTLIST Item
//    Name CDATA #REQUIRED
//    Type (Integer|Date|Flags|Qualifier|Enumerator|Unknown) #REQUIRED>

function getDtdAttListTags(txt: string): string[] {
  return getDtdTags(txt, 'attlist')
}

function parseDtdAttListTag(txt: string): Array<DtdAtt> {
  const rsElName = /\S+/.source
  const _ = txt.match(rsElName)
  const en = _?.length === 1 ? _[0] : null
  if (en === null) throw new Error('No element name.')

  const an = /(?<n>[^\s()]+)\s+/.source
  const at = /(?<t>\(.+?\)|[^\s()]+)\s+/.source
  const av = /(?<v>(#FIXED\s+[^\s()]+)|((?=[#'"])[^\s()]+))/.source

  const re = RegExp(`(?:${en}\\s)?(?:${an + at + av})`, 'gsm')

  const mgs = [...txt.matchAll(re)].map((_) => _.groups)
  let attrs: DtdAtt[] = []
  mgs.forEach((mg) => {
    if (mg) {
      let t = cleanContent(mg.t, ['|', ',', '(', ')'])
      if (t in attValType) {
        t = attValType[t]
      }
      const attr: DtdAtt = { eleName: en, name: mg.n, type: t, value: mg.v }
      attrs.push(attr)
    }
  })
  return attrs
}

function getDtdAttributes(txt: string): Array<DtdAtt> {
  const attListTags = getDtdAttListTags(txt)
  const attList = attListTags
    .flatMap((_) => parseDtdAttListTag(_))
    .filter((_) => _ !== undefined)
  return attList
}
