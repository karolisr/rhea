export type { DtdEntity }
export { parseDtdEntityTag }
export { getDtdEntities }

import { getDtdTags } from './dtd-common'
import { cleanContent } from './utils'
import { getDtd } from '$lib/stores/dtd-cache'
import { downloadDtd } from '$lib/stores/dtd-cache'

interface DtdEntity {
  name: string
  varName: string | undefined
  value: string
  external: string | undefined
  extra: string[]
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

async function getDtdEntities(
  txt: string,
  refUrl?: string
): Promise<Array<DtdEntity>> {
  const entityTags = getDtdEntityTags(txt)
  const entityPromises = entityTags.map((_) =>
    parseDtdEntityTag(_)
  )
  let entities: Array<DtdEntity> = []
  for await (const en of entityPromises) {
    if (en !== undefined) {
      if (en.external !== undefined) {
        const dtdTxt =
          getDtd(en.value) || (await downloadDtd(en.value, refUrl, false))
        if (dtdTxt !== null) {
          const externalEntities = await getDtdEntities(dtdTxt.data, refUrl)
          entities = [...externalEntities, ...entities]
          en.value = dtdTxt.data
        }
      }

      entities.push(en)
    }
  }
  return entities
}

async function parseDtdEntityTag(
  txt: string
): Promise<DtdEntity | undefined> {
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
    let vn = undefined
    if (n.startsWith('%')) {
      n = n.replace('%', '').trim()
      vn = `%${n};`
    }

    const rv: DtdEntity = {
      name: n,
      varName: vn,
      value: c[c.length - 1],
      external: _.e,
      extra: c.slice(0, c.length - 1)
    }

    return rv
  } else {
    return undefined
  }
}
