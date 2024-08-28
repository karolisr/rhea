export { getDtdTags }

const rsDtdTag: string = /<!(?!--)(?<tag>\S*)\s*(?<contents>.*?)\s*>/.source
const rsXmlDoctypeTag: string = /<!DOCTYPE\s*(.*?)\s*>/.source
const rsDtdEntTag: string = /<!ENTITY\s*(.*?)\s*>/.source
const rsDtdElementTag: string = /<!ELEMENT\s*(.*?)\s*>/.source
const rsDtdAttListTag: string = /<!ATTLIST\s*(.*?)\s*>/.source

const rxDtdTag: RegExp = RegExp(rsDtdTag, 'gs')
const rxXmlDoctypeTag: RegExp = RegExp(rsXmlDoctypeTag, 'gs')
const rxDtdEntTag: RegExp = RegExp(rsDtdEntTag, 'gs')
const rxDtdElementTag: RegExp = RegExp(rsDtdElementTag, 'gs')
const rxDtdAttListTag: RegExp = RegExp(rsDtdAttListTag, 'gs')

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
