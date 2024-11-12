export { parseDtdTxt }

import type { DtdElement } from './dtd-element'
import type { DtdElementContentParsed } from './dtd-element'

import { getDtdEntities } from './dtd-entity'
import { getDtdElements } from './dtd-element'
import { getDtdAttributes } from './dtd-attlist'

interface DtdElementType {
  [key: string]: string
}

const eleValType: DtdElementType = {
  '#PCDATA': 'StringT',
  '%BITS;': 'StringT',
  '%INTEGER;': 'IntegerT',
  '%OCTETS;': 'StringT',
  '%REAL;': 'FloatT',
  '%T_int;': 'IntegerT',
  '%T_string;': 'StringT'
}

// const eleValTypes = new Set(Object.values(eleValType))

function parseDtdTxt(txt: string, refUrl?: string) {
  return _parseDtdTxt(txt, refUrl)
}

async function _parseDtdTxt(
  txt: string,
  refUrl?: string
): Promise<DtdElement[]> {
  const entities = await getDtdEntities(txt, refUrl)

  let txtUpdated = txt

  for (let i = 0; i < entities.length; i++) {
    const ent = entities[i]
    if (ent.external !== undefined && ent.varName !== undefined) {
      txtUpdated = txtUpdated.replaceAll(ent.varName, ent.value)
    }
  }

  for (let i = 0; i < entities.length; i++) {
    const ent = entities[i]
    if (ent.external === undefined && ent.varName !== undefined) {
      if (ent.varName in eleValType) {
        const entReplVal: string = eleValType[ent.varName]
        ent.value = ent.value.replaceAll('#PCDATA', entReplVal)
      }
      txtUpdated = txtUpdated.replaceAll(ent.varName, ent.value)
    }
  }

  txtUpdated = txtUpdated.replaceAll('#PCDATA', 'StringT')

  const attributes = getDtdAttributes(txtUpdated)
  const elements = getDtdElements(txtUpdated, attributes)
  const _elementsByName: { [k: string]: DtdElement } = {}
  elements.forEach((e) => {
    _elementsByName[e.name] = e
  })

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    printDtdElement(ele)
  }

  return elements
}

function printDtdElementContentParsed(
  content: DtdElementContentParsed,
  level: number = 1
) {
  if (content.items !== undefined) {
    for (let i = 0; i < content.items.length; i++) {
      const itmContent: DtdElementContentParsed = content.items[i]
      let itmName: string = itmContent.type ? itmContent.type : ''
      itmName = itmName + (itmContent.nReq ? `(${itmContent.nReq})` : '')
      itmName = itmName + (itmContent.oneOfItems ? ' ONE OF:' : '')
      console.info(''.padStart(2 * level) + `${itmName}`)
      if (itmContent.items !== undefined) {
        printDtdElementContentParsed(itmContent, level + 1)
      }
    }
  }
}

function printDtdElement(ele: DtdElement) {
  console.info(`${ele.name}:`)
  printDtdElementContentParsed(ele.content)
  console.info(''.padEnd(60, '-'))
}
