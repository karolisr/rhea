export { getDtdElements }

import type { DtdAtt } from './dtd-attlist'
import { getDtdTags } from './dtd-common'
import { cleanContent } from './utils'
import { getPropNames } from '$lib/utils'

export interface DtdElement {
  name: string
  content: DtdElementContentParsed
  attributes: Array<DtdAtt>
}

const unxpctdCondMsg: string = 'Unexpected condition!'

interface DtdElementContentParsed {
  type?: string
  nReq?: string
  oneOfItems?: boolean
  items?: DtdElementContentParsed[]
  description?: string
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

function parseDtdElementNodeStr(nodeStr: string) {
  nodeStr = nodeStr.replaceAll(/\s/g, '')
  const list = (nodeStr.match(/[,]/g) || []).length === 0 ? false : true
  const oneOfItems = (nodeStr.match(/[|]/g) || []).length === 0 ? false : true

  let nodeItems: string[] = []
  let nodeItemsParsed: DtdElementContentParsed[] = []

  if (list && oneOfItems) {
    console.warn(unxpctdCondMsg)
  } else if (list) {
    nodeItems = nodeStr.split(',')
  } else if (oneOfItems) {
    nodeItems = nodeStr.split('|')
  } else {
    nodeItems = [nodeStr]
  }

  for (let j = 0; j < nodeItems.length; j++) {
    const itm = nodeItems[j]
    let itmTmp = itm.slice(0, itm.length - 1)
    const parsed: DtdElementContentParsed = {
      type: itm
      // nReq: '1'
    }
    switch (itm[itm.length - 1]) {
      case '?':
        parsed.nReq = '?'
        parsed.type = itmTmp
        break

      case '*':
        parsed.nReq = '*'
        parsed.type = itmTmp
        break

      case '+':
        parsed.nReq = '+'
        parsed.type = itmTmp
        break

      default:
        break
    }
    nodeItemsParsed.push(parsed)
  }
  return { items: nodeItemsParsed, oneOfItems }
}

function parseDtdElementContentStrToNodes(
  str: string,
  grpId: number = 1,
  nodes: {
    [n: string]: { items: DtdElementContentParsed[]; oneOfItems: boolean }
  } = {}
) {
  const nodeName: string = 'N' + grpId.toString().padStart(1, '0')
  const idxLastGrpBeg: number = str.lastIndexOf('(')
  if (idxLastGrpBeg >= 0) {
    const idxLastGrpEnd: number = str.indexOf(')', idxLastGrpBeg)
    const strL: string = str.slice(0, idxLastGrpBeg)
    const strCurrNode: string = str.slice(idxLastGrpBeg + 1, idxLastGrpEnd)
    const strR: string = str.slice(idxLastGrpEnd + 1, str.length)
    const strNew: string = strL + nodeName + strR
    nodes[nodeName] = parseDtdElementNodeStr(strCurrNode)
    parseDtdElementContentStrToNodes(strNew, grpId + 1, nodes)
  } else {
    // console.log(parseDtdElementNodeStr(str))
    nodes[nodeName] = parseDtdElementNodeStr(str)
  }
  return nodes
}

function parseDtdElementContentNodes(nodes: {
  [n: string]: { items: DtdElementContentParsed[]; oneOfItems: boolean }
}) {
  const nodeNames = getPropNames(nodes)
  for (let i = 0; i < nodeNames.length; i++) {
    const nodeName = nodeNames[i]
    const nodeChildren = nodes[nodeName].items
    for (let j = 0; j < nodeChildren.length; j++) {
      const child = nodeChildren[j]
      if (child.type !== undefined && child.type in nodes) {
        child.items = nodes[child.type].items
        if (child.items.length > 1) {
          child.oneOfItems = nodes[child.type].oneOfItems
          // if (child.oneOfItems === true) {
          //   child.items.map((i) => {
          //     delete i.nReq
          //   })
          // }
        }
        delete child.type
      }
    }
  }

  const root = nodes[nodeNames[nodeNames.length - 1]].items[0]
  // if (root.nReq === '1') delete root.nReq
  // if (root.items === undefined) root.items = []

  return root
}

function parseDtdElementContent(eleContent: string) {
  const nodes = parseDtdElementContentStrToNodes(eleContent)
  const rv = parseDtdElementContentNodes(nodes)
  return rv
}

function parseDtdElementTag(
  txt: string,
  attrs: Array<DtdAtt> = []
): DtdElement | undefined {
  const en: string = /(?:(?<n>\S+)\s+)/.source
  const ec: string = /(?<c>.+)/.source
  const re: RegExp = RegExp(`${en}${ec}`, 'gs')

  const _ = [...txt.matchAll(re)].map((_) => _.groups)[0]
  if (_ !== undefined) {
    const c = parseDtdElementContent(cleanContent(_.c, ['|', ',', '(', ')']))
    const n = _.n
    const a: Array<DtdAtt> = []

    // Populates the "attributes" list for each element.
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i]
      if (attr.eleName === n) {
        a.push(attr)
        delete attr.eleName
      }
    }

    return { name: n, content: c, attributes: a }
  } else {
    return undefined
  }
}

function getDtdElements(
  txt: string,
  attrs: Array<DtdAtt> = []
): Array<DtdElement> {
  const elementTags = getDtdElementTags(txt)
  const elements = elementTags
    .map((_) => parseDtdElementTag(_, attrs))
    .filter((_) => _ !== undefined)
  return elements
}
