export { parseDtdTxt }

import { getXmlDoctypes } from './xml-doctype'
import { getDtdEntities } from './dtd-entity'
import { getDtdElements } from './dtd-element'
import { getDtdAttributes } from './dtd-attlist'

function parseDtdTxt(txt: string) {
  const doctypes = getXmlDoctypes(txt)
  const entities = getDtdEntities(txt)
  const elements = getDtdElements(txt)
  const attributes = getDtdAttributes(txt)
  return { doctypes, entities, elements, attributes }
}
