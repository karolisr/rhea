export { parseDtdTxt }

import type { DtdElement } from './dtd-element'

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

const eleValTypes = new Set(Object.values(eleValType))

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

  const attributes = getDtdAttributes(txtUpdated)
  const elements = getDtdElements(txtUpdated, attributes)
  const _elementsByName: { [k: string]: DtdElement } = {}
  elements.forEach((e) => {
    _elementsByName[e.name] = e
  })

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    console.info(ele)
  }

  return { doctypes, elements }
}
