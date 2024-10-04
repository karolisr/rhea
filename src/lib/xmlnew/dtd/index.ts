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

const unxpctdCondMsg: string = 'Unexpected condition!'

interface DtdContent {
  node: number
  required: string
  content: DtdContent[] | string
}

// const testContent = '(a, b?, (c, d)?, e, (f, (g, h, i, j)*)?, k)*'
function fromEnclosed(
  txt: string,
  a: string = '(',
  b: string = ')',
  seps: string = ',|',
  node: number = 1,
  lvl: number = 0
): DtdContent {
  let count: number = 0
  let inside: string = ''
  let outside: string = ''
  let current: DtdContent[] | string = []

  for (let i = 0; i < txt.length; i++) {
    const char = txt[i]
    if (char.trim() === '') continue
    if (char === b) {
      count -= 1
      if (count === 0 && inside) {
        const c: DtdContent = fromEnclosed(inside, a, b, seps, node, lvl + 1)
        node = c.node + 1
        current.push(c)
        inside = ''
      }
    }
    if (count === 0) {
      outside += char
    } else if (count === 1 && seps.includes(char) && inside) {
      // ToDo: if sep is "|" one of the internal items is required!
      const c: DtdContent = fromEnclosed(inside, a, b, seps, node, lvl + 1)
      node = c.node + 1
      current.push(c)
      inside = ''
    } else {
      inside += char
    }
    if (char === a) count += 1
  }
  outside = outside.replace(a + b, '')
  let r = 'r'
  if ('*+?'.includes(outside)) {
    if (outside !== '') r = outside
  } else {
    const lastChar: string = outside.at(outside.length -1) as string
    if (lastChar !== '' && '*+?'.includes(lastChar)) {
      r = lastChar
      current = outside.slice(0, outside.length - 1)
    } else {
      r = 'r'
      current = outside
    }
  }

  return { node: node, content: current, required: r }
}

function parseDtdElementContent(
  eleContent: string,
  eleName: string = 'DEFAULT'
) {
  const obj = fromEnclosed(eleContent)
  console.log(eleName)
  console.log(obj)
  console.log(JSON.stringify(obj))
}

// parseDtdElementContent(testContent)

// function parseDtdElementContentX(
//   eleContent: string,
//   eleName: string = 'DEFAULT'
// ) {
//   // const reCnt1 = /^(?:\()(?<contentStr>.*)(?:\))(?<nRequired>[*+?])?$/g
//   const reCnt1 = /(?:\()(?<contentStr>.*)(?:\))(?<nRequired>[*+?])?/g
//   const mCnt1 = [...eleContent.matchAll(reCnt1)].map((_) => _.groups)[0]
//   if (mCnt1 !== undefined) {
//     const cnt1Str: string = mCnt1['contentStr']
//     console.info(`RAW: ${cnt1Str}`)

//     const subCntStart: number = cnt1Str.indexOf('(')
//     if (subCntStart !== -1) {
//       let subCntEnd: number = cnt1Str.indexOf(')')
//       const subCntNRequired = cnt1Str.slice(subCntEnd + 1, subCntEnd + 2)
//       if ('*+?'.includes(subCntNRequired)) {
//         subCntEnd += 1
//       }
//       const subCnt: string = cnt1Str.slice(subCntStart, subCntEnd + 1)
//       console.info(`SUB: ${subCnt}`)
//       parseDtdElementContent(subCnt)
//     }

//     if (mCnt1['nRequired'] !== undefined) {
//       const nRequired = mCnt1['nRequired']
//       const cnt1Itms = cnt1Str.split('|')
//       for (let i = 0; i < cnt1Itms.length; i++) {
//         const cnt1Itm = cnt1Itms[i]
//         console.info(`${eleName}: ${cnt1Itm}`)
//       }
//       if (nRequired === '*') {
//         console.info(`${eleName}: (${cnt1Itms.join('|')})*`)
//       } else if (nRequired === '+') {
//         console.info(`${eleName}: (${cnt1Itms.join('|')})+`)
//       } else {
//         console.warn(unxpctdCondMsg)
//       }
//     } else {
//       if (eleValTypes.has(cnt1Str)) {
//         console.info(`${eleName}: ${cnt1Str}`)
//       } else {
//         const cnt1Itms = cnt1Str.split(',')
//         for (let i = 0; i < cnt1Itms.length; i++) {
//           const cnt1Itm = cnt1Itms[i]
//           const reCnt2 = /^(?<contentStr>[^\s*+?]+)(?<nRequired>[*+?])?$/g
//           const mCnt2 = [...cnt1Itm.matchAll(reCnt2)].map((_) => _.groups)[0]
//           if (mCnt2 !== undefined) {
//             if (mCnt2['nRequired'] !== undefined) {
//               const nRequired = mCnt2['nRequired']
//               if (nRequired === '*') {
//                 // optional (zero or more)
//                 console.info(`${eleName}: ${mCnt2['contentStr']}${nRequired}`)
//               } else if (nRequired === '+') {
//                 // required (one or more)
//                 console.info(`${eleName}: ${mCnt2['contentStr']}${nRequired}`)
//               } else if (nRequired === '?') {
//                 // optional (zero or one)
//                 console.info(`${eleName}: ${mCnt2['contentStr']}${nRequired}`)
//               } else {
//                 console.warn(unxpctdCondMsg)
//               }
//             } else if (mCnt2['contentStr'] !== undefined) {
//               // required (one)
//               console.info(`${eleName}: ${mCnt2['contentStr']}`)
//             } else {
//               console.warn(unxpctdCondMsg)
//             }
//           } else {
//             console.warn(unxpctdCondMsg)
//           }
//         }
//       }
//     }
//   } else {
//     if (eleContent === 'EMPTY') {
//       console.info(`${eleName}: ${eleContent}`)
//     } else {
//       console.warn(unxpctdCondMsg)
//     }
//   }
// }

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
  // for (let i = 0; i < attributes.length; i++) {
  //   const attr = attributes[i]
  //   if (attr.en in _elementsByName) {
  //     _elementsByName[attr.en].attributes.push(attr)
  //   }
  // }

  // for (let i = 0; i < elements.length; i++) {
  //   const ele = elements[i]
  //   for (let k = 0; k < ele.attributes.length; k++) {
  //     const attr = ele.attributes[k]
  //     const attrEle: DtdElement = {
  //       name: attr.an,
  //       type: attr.at,
  //       value: attr.av,
  //       attributes: [],
  //       content: 'UNSET',
  //       items: []
  //     }
  //     ele.items.push(attrEle)
  //   }
  // }

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    parseDtdElementContent(ele.content, ele.name)
    // for (let j = 0; j < parsedContent.length; j++) {
    //   const cntItm = parsedContent[j]
    //   if (cntItm in _elementsByName) {
    //     ele.items.push(_elementsByName[cntItm])
    //   } else if (eleValTypes.has(cntItm)) {
    //     ele.type = cntItm
    //   } else if (cntItm === 'EMPTY') {
    //     ele.type = cntItm
    //   } else {
    //     console.warn(unxpctdCondMsg)
    //   }
    // }

    // When only a single item with the name "value" exists (probably an attribute-derived item),
    // set the element's type to this item's type and remove the item from the list.
    // if (
    //   ele.type === 'EMPTY' &&
    //   ele.items.length === 1 &&
    //   ele.items[0].name === 'value'
    // ) {
    //   ele.type = ele.items[0].type
    //   ele.items = []
    // }
    console.info('------------------------------')
  }

  console.info(
    '\n------------------------------------------------------------\n'
  )

  // for (let i = 0; i < elements.length; i++) {
  //   const ele = elements[i]
  //   console.info(`- ${ele.name}: ${ele.value} (${ele.type})`)
  //   for (let j = 0; j < ele.items.length; j++) {
  //     const eleItm = ele.items[j]
  //     console.log(`    ${eleItm.name}: ${eleItm.value} (${eleItm.type})`)
  //   }
  // }

  return { doctypes, elements }
}
