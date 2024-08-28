export type { DtdEntity }
export { parseDtdEntityTag }
export { getDtdEntities }

import { getDtdTags } from './dtd-common'
import { cleanContent } from './utils'

interface DtdEntity {
  name: string
  value: string
  external: string | undefined
}

// <!ENTITY   entity-name                       "entity-value">
// <!ENTITY % entity-name                       "entity-value">
// <!ENTITY % entity-name PUBLIC                "entity-value">
// <!ENTITY % entity-name SYSTEM                "entity-value">
// <!ENTITY % entity-name PUBLIC "sometimes..." "entity-value">
// <!ENTITY % entity-name SYSTEM "sometimes..." "entity-value">

const rsName = /(?:(?<n>(%\s+)?\S+)\s+)/.source
const rsExtr = /(?:(?<e>\S+)\s+)?/.source
const rsCont = /(?<c>(".+")|('.+'))/.source
const rxEnt = RegExp(`${rsName}${rsExtr}${rsCont}`, 'gs')

const rsSubCont = /(?:['"](?<m>.*?)['"])/.source
const rxSubCont = RegExp(rsSubCont, 'gs')

function getDtdEntityTags(txt: string): string[] {
  return getDtdTags(txt, 'entity')
}

function getDtdEntities(txt: string): Array<DtdEntity> {
  const entityTags = getDtdEntityTags(txt)
  const entities = entityTags
    .map((_) => parseDtdEntityTag(_))
    .filter((_) => _ !== undefined)
  return entities
}

function parseDtdEntityTag(txt: string): DtdEntity | undefined {
  const _ = [...txt.matchAll(rxEnt)].map((_) => _.groups)[0]
  if (_ !== undefined) {
    const cntnt = _.c.matchAll(rxSubCont)
    const m = [...cntnt].map((_) => (_.groups ? _.groups['m'] : ''))
    const c: string[] = []
    for (let i = 0; i < m.length; i++) {
      const x = m[i]
      const v = cleanContent(x, ['|', '(', ')'])
      c.push(v)
    }

    let n = _.n
    if (n.startsWith('%')) {
      n = n.replace('%', '').trim()
      n = `%${n};`
    }

    return { name: n, value: c[c.length - 1], external: _.e }
  } else {
    return undefined
  }
}
