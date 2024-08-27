function carriageReturnToNewLine(s: string): string {
  return s.replaceAll(/\r/g, '\n')
}

function oneLine(s: string): string {
  return s.replaceAll(/[\r\n]/g, ' ')
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function noWhiteSpaceAroundSep(s: string, seps: string[]): string {
  let rv = s

  for (let i = 0; i < seps.length; i++) {
    const sep = seps[i]
    const rx: RegExp = RegExp(`\\s*${escapeRegExp(sep)}\\s*`, 'g')
    rv = rv.replaceAll(rx, sep)
  }

  return rv
}

function trimExtraWhiteSpace(s: string): string {
  const rx: RegExp = /\s+/g
  return s.replaceAll(rx, ' ')
}

const rxsDtdTag: string = /<!(?!--)(?<tag>\S*)\s*(?<contents>.*?)\s*>/.source
const rxDtdTag: RegExp = RegExp(rxsDtdTag, 'gs')

const rxsXmlDoctypeTag: string = /<!DOCTYPE\s*(.*?)\s*>/.source
const rxXmlDoctypeTag: RegExp = RegExp(rxsXmlDoctypeTag, 'gs')

// <!ENTITY   entity-name                         "entity-value">
// <!ENTITY % entity-name                         "entity-value">
// <!ENTITY % entity-name PUBLIC "blah blah blah" "entity-value">
const rxsDtdEntTag: string = /<!ENTITY\s*(.*?)\s*>/.source
const rxDtdEntTag: RegExp = RegExp(rxsDtdEntTag, 'gs')
const rxsDtdEntName: string = /(?<name>(?:%?\s+\S+)|(?:\S+))/.source
const rxsDtdEntExtr: string = /(?:(?<external>\S+))?/.source
const rxsDtdEntCont: string = /(?<content>['"].+['"])/.source
const rxDtdEnt: RegExp = RegExp(
  `${rxsDtdEntName}(?:\\s+)${rxsDtdEntExtr}(?:\\s+)${rxsDtdEntCont}(?:\\s+)?`,
  'gs'
)
const rxsDtdEntSubCont: string = /(?:['"](?<m>.*?)['"])/.source
const rxDtdEntSubCont: RegExp = RegExp(rxsDtdEntSubCont, 'gs')

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
const rxsDtdElementTag: string = /<!ELEMENT\s*(.*?)\s*>/.source
const rxDtdElementTag: RegExp = RegExp(rxsDtdElementTag, 'gs')
const rxsDtdEleName: string = /(?<name>\S+)/.source
const rxsDtdEleCont: string = /(?<content>.+)/.source
const rxDtdEle: RegExp = RegExp(
  `${rxsDtdEleName}(?:\\s+)${rxsDtdEleCont}`,
  'gs'
)

// <!ATTLIST element-name attr-name attr-type attr-default>
// <!ATTLIST element-name
//     attr-name attr-type value
//     attr-name attr-type #FIXED "value"
//     attr-name attr-type #REQUIRED
//     attr-name attr-type #IMPLIED
// >
//
// Attribute types:
// CDATA, ID, IDREF, IDREFS, (true|false), ...
//
// <!ATTLIST Item
//     Name CDATA #REQUIRED
//     Type (Integer|Date|Flags|Qualifier|Enumerator|Unknown) #REQUIRED
// >
const rxsDtdAttListTag: string = /<!ATTLIST\s*(.*?)\s*>/.source
const rxDtdAttListTag: RegExp = RegExp(rxsDtdAttListTag, 'gs')

const dtdRegExes = {
  attlist: rxDtdAttListTag,
  doctype: rxXmlDoctypeTag,
  element: rxDtdElementTag,
  entity: rxDtdEntTag
}

type DtdRegExes = keyof typeof dtdRegExes

function getDtdTags(txt: string, rx: DtdRegExes): string[] {
  const m = txt.matchAll(dtdRegExes[rx])
  return [...m].map((_) => _[1])
}

function getXmlDoctypeTags(txt: string): string[] {
  return getDtdTags(txt, 'doctype')
}

function getDtdEntityTags(txt: string): string[] {
  return getDtdTags(txt, 'entity')
}

function getDtdElementTags(txt: string): string[] {
  return getDtdTags(txt, 'element')
}

function getDtdAttListTags(txt: string): string[] {
  return getDtdTags(txt, 'attlist')
}

interface DtdEntityTag {
  name: string
  value: string
  external: string | undefined
  // content: string[]
}

function _parseDtdEntityTag(txt: string): DtdEntityTag | undefined {
  const _ = [...txt.matchAll(rxDtdEnt)].map((_) => _.groups)[0]
  if (_ !== undefined) {
    const cntnt = _.content.matchAll(rxDtdEntSubCont)
    const m = [...cntnt].map((_) => (_.groups ? _.groups['m'] : ''))

    const c: string[] = []
    for (let i = 0; i < m.length; i++) {
      const x = m[i]
      const v = noWhiteSpaceAroundSep(trimExtraWhiteSpace(x), ['|', '(', ')'])
      c.push(v)
    }

    const rv: DtdEntityTag = {
      name: _.name,
      value: c[c.length - 1],
      external: _.external
      // content: c,
    }
    return rv
  } else {
    return undefined
  }
}

function parseDtdEntityTag(txt: string): DtdEntityTag | undefined {
  return _parseDtdEntityTag(txt)
}

interface XmlDoctypeTag extends DtdEntityTag {}

function parseXmlDoctypeTag(txt: string): XmlDoctypeTag | undefined {
  return _parseDtdEntityTag(txt)
}

function parseDtdElementTag(txt: string) {
  const _ = [...txt.matchAll(rxDtdEle)].map((_) => _.groups)[0]
  if (_ !== undefined) {
    const n = _.name
    const c = noWhiteSpaceAroundSep(trimExtraWhiteSpace(_.content), [
      '|',
      ',',
      '(',
      ')'
    ])
    return { name: n, content: c }
  } else {
    return undefined
  }
}

function parseDtdAttListTag(txt: string) {
  return trimExtraWhiteSpace(txt)
}

export function parseDtdTxt(txt: string) {
  const doctypeTags = getXmlDoctypeTags(txt)
  const doctypes = doctypeTags.map((_) => parseXmlDoctypeTag(_))

  const entityTags = getDtdEntityTags(txt)
  const entities = entityTags.map((_) => parseDtdEntityTag(_))

  const elementTags = getDtdElementTags(txt)
  const elements = elementTags.map((_) => parseDtdElementTag(_))

  const attrListTags = getDtdAttListTags(txt)
  const attrLists = attrListTags.map((_) => parseDtdAttListTag(_))

  return elements
}
