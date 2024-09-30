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

function parseDtdElementContent(cnt: string) {
  const re = /^(?:\()(?<inside>.*)(?:\))(?<count>[*+?])?$/g
  const m = [...cnt.matchAll(re)].map((_) => _.groups)[0]
  if (m !== undefined) {
    if (m['count'] !== undefined) {
      const count = m['count']
      const inside = m['inside'].split('|')
      if (count === '*') {
        // console.info(`- Zero or more of [${inside.join(', ')}]`)
        return inside
      } else if (count === '+') {
        // console.info(`-  One or more of [${inside.join(', ')}]`)
        return inside
      } else {
        console.warn('Should never happen!')
        return []
      }
    } else {
      if (eleValTypes.has(m['inside'])) {
        // String, Integer, Float...
        // console.info(`    ${m['inside']}`)
        return [m['inside']]
      } else {
        // Complex
        const inside = m['inside'].split(',')
        const rv = []
        for (let i = 0; i < inside.length; i++) {
          const ins = inside[i]
          const re2 = /^(?<inside>[^\s*+?]+)(?<required>[*+?])?$/g
          const m2 = [...ins.matchAll(re2)].map((_) => _.groups)[0]
          if (m2 !== undefined && m2['required'] !== undefined) {
            const required = m2['required']
            if (required === '*') {
              // console.info(`0 + ${m2['inside']}`)
              rv.push(m2['inside'])
            } else if (required === '+') {
              // console.info(` 1+ ${m2['inside']}`)
              rv.push(m2['inside'])
            } else if (required === '?') {
              // console.info(`01  ${m2['inside']}`)
              rv.push(m2['inside'])
            } else {
              console.warn('Should never happen!')
            }
          } else if (m2 !== undefined && m2['inside'] !== undefined) {
            // console.info(` 1  ${m2['inside']}`)
            rv.push(m2['inside'])
          }
        }
        return rv
      }
    }
  } else {
    if (cnt === 'EMPTY') {
      // console.info(`    EMPTY`)
      return ['EMPTY']
    } else {
      console.warn(`     ${cnt}`)
      return []
    }
  }
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

  const attributes = getDtdAttributes(txtUpdated)
  const elements = getDtdElements(txtUpdated)
  const _elementsByName: { [k: string]: DtdElement } = {}
  elements.forEach((e) => {
    _elementsByName[e.name] = e
  })

  // Populates the "attributes" list for each element.
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i]
    if (attr.en in _elementsByName) {
      _elementsByName[attr.en].attributes.push(attr)
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    for (let k = 0; k < ele.attributes.length; k++) {
      const attr = ele.attributes[k]
      const attrEle: DtdElement = {
        name: attr.an,
        type: attr.at,
        value: attr.av,
        attributes: [],
        content: 'UNSET',
        items: []
      }
      ele.items.push(attrEle)
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    const parsedConstent = parseDtdElementContent(ele.content)
    for (let j = 0; j < parsedConstent.length; j++) {
      const cntItm = parsedConstent[j]
      if (cntItm in _elementsByName) {
        ele.items.push(_elementsByName[cntItm])
      } else if (eleValTypes.has(cntItm)) {
        ele.type = cntItm
      }
    }
  }

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    console.info(`==> ${ele.name}`)
    for (let j = 0; j < ele.items.length; j++) {
      const eleItm = ele.items[j]
      console.log(`    ${eleItm.name}: ${eleItm.type}`)
    }
  }

  return { doctypes, elements }
}
