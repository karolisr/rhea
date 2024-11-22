export { parseDtdTxt }

import type { DtdEle, DtdEleContent } from './dtd-element'

import { getDtdEntities } from './dtd-entity'
import { getDtdElements } from './dtd-element'
import { getDtdAttributes, type DtdEleAtt } from './dtd-attlist'

interface DtdEleType {
  [key: string]: string
}

const eleValType: DtdEleType = {
  '#PCDATA': 'string',
  '%BITS;': 'string',
  '%INTEGER;': 'number',
  '%OCTETS;': 'string',
  '%REAL;': 'number',
  '%T_int;': 'number',
  '%T_string;': 'string'
}

async function parseDtdTxt(txt: string, refUrl?: string): Promise<DtdEle[]> {
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

  txtUpdated = txtUpdated.replaceAll('#PCDATA', 'string')

  const attributes = getDtdAttributes(txtUpdated)
  const elements = getDtdElements(txtUpdated, attributes)
  const elesByName: { [k: string]: DtdEle } = {}
  elements.forEach((e) => {
    elesByName[e.name] = e
  })

  const types: { [k: string]: string } = {}

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    prntDtdEle(ele, elesByName, types, false)
  }

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    prntDtdEle(ele, elesByName, types, false)
  }

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]
    prntDtdEle(ele, elesByName, types, true)
  }

  return elements
}

function prnt(val: string | number | boolean, lvl: number, ind: number) {
  console.info(''.padStart(ind * lvl) + `${val}`)
}

function prntDtdEle(
  ele: DtdEle,
  elesByName: { [k: string]: DtdEle },
  types: { [k: string]: string },
  print: boolean = true
) {
  prntDtdEleContent(ele, elesByName, types, 0, 2, print)
}

function printDtdEleAttrs(attrs: DtdEleAtt[], lvl: number, ind: number) {
  for (let i = 0; i < attrs.length; i++) {
    const att = attrs[i]
    prnt(`${att.name}${att.value}: ${att.type}`, lvl, ind)
  }
}

function prntDtdEleContent(
  ele: DtdEle,
  elesByName: { [k: string]: DtdEle },
  types: { [k: string]: string },
  lvl: number,
  ind: number,
  print: boolean = true
) {
  const eleCont: DtdEleContent = ele.content
  const eleName: string = ele.name.replaceAll('-', '_')
  let nReq: string = eleCont.nReq ? eleCont.nReq : ''
  if (eleCont.type === 'EMPTY') {
    if (ele.attributes.length === 1 && ele.attributes[0].name === 'value') {
      types[eleName] = ele.attributes[0].type
      // =======================================================================
      // if (print) {
      //   prnt(`type ${eleName} = ${ele.attributes[0].type}`, lvl, ind)
      // }
      // =======================================================================
    } else {
      if (print) {
        prnt(`interface ${eleName} {`, lvl, ind)
        printDtdEleAttrs(ele.attributes, lvl + 1, ind)
        prnt(`}\n`, lvl, ind)
      }
    }
  } else if (eleCont.items !== undefined) {
    const itms = eleCont.items
    const itm = itms[0]
    // -------------------------------------------------------------------------
    if (itms.length === 1) {
      if (itm.type !== undefined) {
        const itmType: string = itm.type.replaceAll('-', '_')
        if (itm.nReq === undefined && nReq === '') {
          if (ele.attributes.length === 0) {
            types[eleName] = itmType
            // =================================================================
            // if (print) {
            //   prnt(`type ${eleName} = ${itmType}`, lvl, ind)
            // }
            // =================================================================
          } else {
            if (print) {
              prnt(`interface ${eleName} {`, lvl, ind)
              printDtdEleAttrs(ele.attributes, lvl + 1, ind)
              prnt(`value: ${itmType}`, lvl + 1, ind)
              prnt(`}\n`, lvl, ind)
            }
          }
        } else if (itm.nReq === '?') {
          if (print) {
            prnt(`interface ${eleName} {`, lvl, ind)
            prnt(`${itmType}${itm.nReq}: ${itmType}`, lvl + 1, ind)
            prnt(`}\n`, lvl, ind)
          }
        } else if (itm.nReq === '+' || itm.nReq === '*' || nReq === '+') {
          let _ = `${itmType}[]`
          if (itmType in types) {
            _ = `${types[itmType]}[]`
          }
          if (ele.attributes.length === 0) {
            types[eleName] = _
            // =================================================================
            // if (print) {
            //   prnt(`type ${eleName} = ${_}`, lvl, ind)
            // }
            // =================================================================
          } else {
            if (print) {
              prnt(`interface ${eleName} {`, lvl, ind)
              printDtdEleAttrs(ele.attributes, lvl + 1, ind)
              prnt(`value: ${_}`, lvl + 1, ind)
              prnt(`}\n`, lvl, ind)
            }
          }
        }
      }
    }
    // -------------------------------------------------------------------------
    else {
      if (eleCont.oneOfItems && eleCont.nReq === '+') {
        const _ = `(${itms.map((_) => _.type).join(' | ')})[]`.replaceAll(
          '-',
          '_'
        )
        if (ele.attributes.length === 0) {
          types[eleName] = _
          // =================================================================
          // if (print) {
          //   prnt(`type ${eleName} = ${_}`, lvl, ind)
          // }
          // =================================================================
        } else {
          if (print) {
            prnt(`interface ${eleName} {`, lvl, ind)
            printDtdEleAttrs(ele.attributes, lvl + 1, ind)
            prnt(`value: ${_}`, lvl + 1, ind)
            prnt(`}\n`, lvl, ind)
            console.log(eleName, ele.attributes)
          }
        }
      }
      // =======================================================================
      // else if (eleCont.oneOfItems && eleCont.nReq === '*') {
      //   const _ = `(${itms.map((_) => _.type).join(' | ')})[]`.replaceAll(
      //     '-',
      //     '_'
      //   )
      //   // if (ele.attributes.length === 0) {
      //   //   types[eleName] = _
      //   // } else {
      //   if (print) {
      //     prnt(`interface ${eleName} {`, lvl, ind)
      //     printDtdEleAttrs(ele.attributes, lvl + 1, ind)
      //     prnt(`value?: ${_}`, lvl + 1, ind)
      //     prnt(`}\n`, lvl, ind)
      //   }
      //   // }
      // }
      // =======================================================================
      else {
        if (print) {
          prnt(`interface ${eleName} {`, lvl, ind)
          printDtdEleAttrs(ele.attributes, lvl + 1, ind)
        }
        for (let i = 0; i < itms.length; i++) {
          const itm = itms[i]
          const itmType: string = itm.type ? itm.type.replaceAll('-', '_') : ''
          let itmNReq: string = itm.nReq ? itm.nReq : ''
          // ===================================================================
          if (eleCont.oneOfItems && eleCont.nReq === '*') itmNReq = '?'
          // ===================================================================

          // -------------------------------------------------------------------
          // if itmType is an empty string, it means that it is composed
          // of multiple sub-items (elements) that must be either:
          //    1. all be present
          //    2. none of them be present (if the nameless item is optional)
          // These sub-items, however, will be listed in the list of children
          // belonging to the parent element (not this "nameless item", but its
          // parent). Thus, while we know from the information present in the
          // DTD that these elements must occur together, there is no indication
          // of this within the XML hierarchy itself, i.e. there is no element
          // within the XML that groups these items together.
          // -------------------------------------------------------------------

          // -------------------------------------------------------------------
          // OPTION A (more information but cumbersome, and will require
          //           defining additional types/interfaces.)
          // -------------------------------------------------------------------
          // if (itmType === '') {
          //   if (print && itm.items !== undefined) {
          //     if (!itm.oneOfItems) {
          //       for (let j = 0; j < itm.items.length; j++) {
          //         const subItm = itm.items[j]
          //         const subItmType: string = subItm.type
          //           ? subItm.type.replaceAll('-', '_')
          //           : ''
          //         prnt(
          //           `${subItmType}${itmNReq}: ${types[subItmType]}`,
          //           lvl + 1,
          //           ind
          //         )
          //       }
          //     } else {
          //       const _ =
          //         `${itm.items.map((_) => _.type).join(' | ')}`.replaceAll(
          //           '-',
          //           '_'
          //         )
          //       if (itmNReq === '*') {
          //         prnt(`NONE_OR_MORE_OF_THESE?: (${_})[]`, lvl + 1, ind)
          //       } else if (itmNReq === '+') {
          //         prnt(`ONE_OR_MORE_OF_THESE: (${_})[]`, lvl + 1, ind)
          //       } else if (itmNReq === '?') {
          //         prnt(`NONE_OR_ONE_OF_THESE?: ${_}`, lvl + 1, ind)
          //       } else {
          //         prnt(`ONE_OF_THESE: ${_}`, lvl + 1, ind)
          //       }
          //     }
          //   }
          // }
          // -------------------------------------------------------------------

          // -------------------------------------------------------------------
          //  OPTION B (less information, but will work assuming NCBI follow
          //            their own DTD specification.)
          // -------------------------------------------------------------------
          if (itmType === '') {
            if (print && itm.items !== undefined) {
              for (let j = 0; j < itm.items.length; j++) {
                const subItm = itm.items[j]
                const subItmType: string = subItm.type
                  ? subItm.type.replaceAll('-', '_')
                  : ''
                prnt(`${subItmType}?: ${types[subItmType]}`, lvl + 1, ind)
              }
            }
          }
          // -------------------------------------------------------------------
          else {
            if (itmType in types) {
              if (print) {
                if (itmNReq === '*') {
                  prnt(`${itmType}?: ${types[itmType]}[]`, lvl + 1, ind)
                } else if (itmNReq === '+') {
                  prnt(`${itmType}: ${types[itmType]}[]`, lvl + 1, ind)
                } else {
                  prnt(`${itmType}${itmNReq}: ${types[itmType]}`, lvl + 1, ind)
                }
              }
            } else {
              if (print) {
                if (itmNReq === '*') {
                  prnt(`${itmType}?: ${itmType}[]`, lvl + 1, ind)
                } else if (itmNReq === '+') {
                  prnt(`${itmType}: ${itmType}[]`, lvl + 1, ind)
                } else {
                  prnt(`${itmType}${itmNReq}: ${itmType}`, lvl + 1, ind)
                }
              }
            }
          }
        }
        if (print) {
          prnt(`}\n`, lvl, ind)
        }
      }
    }
  }
}
