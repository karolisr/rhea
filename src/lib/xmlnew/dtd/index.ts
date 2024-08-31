export { parseDtdTxt }

import { getXmlDoctypes } from './xml-doctype'
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

function parseDtdTxt(txt: string) {
  return _parseDtdTxt(txt)
}

function _parseDtdTxt(txt: string) {
  const doctypes = getXmlDoctypes(txt)
  const entities = getDtdEntities(txt)

  let txtUpdated = txt
  for (let i = 0; i < entities.length; i++) {
    const ent = entities[i]
    if (ent.varName !== undefined) {
      if (ent.varName in eleValType) {
        const entReplVal: string = eleValType[ent.varName]
        ent.value = ent.value.replaceAll('#PCDATA', entReplVal)
      }
      const replVal: string = ent.value
      txtUpdated = txtUpdated.replaceAll(ent.varName, replVal)
    }
  }

  txtUpdated = txtUpdated.replaceAll('#PCDATA', 'StringT')

  const elements = getDtdElements(txtUpdated)

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    // console.log(ele)
    const re = /^(?:\()(?<inside>.*)(?:\))(?<count>[*+?])?$/g
    const m = [...ele.content.matchAll(re)].map((_) => _.groups)[0]
    if (m !== undefined) {
      if (m['count'] !== undefined) {
        console.info(`${m['count']} :: ${ele.name} :: ${m['inside']}`)
      } else {
        console.info(`     ${ele.name} :: ${m['inside']}`)
      }
    } else {
      if (ele.content === 'EMPTY') {
        console.info(`     ${ele.name} :: EMPTY`)
      } else {
        console.warn(`     ${ele.name} :: ${ele.content}`)
      }
    }
  }

  const attributes = getDtdAttributes(txtUpdated)

  return { doctypes, entities, elements, attributes }
}
