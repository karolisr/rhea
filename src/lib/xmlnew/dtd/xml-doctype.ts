export { getXmlDoctypes }

import type { DtdEntity } from './dtd-entity'
import { parseDtdEntityTag } from './dtd-entity'
import { getDtdTags } from './dtd-common'

interface XmlDoctype extends DtdEntity {}

function getXmlDoctypeTags(txt: string): string[] {
  return getDtdTags(txt, 'doctype')
}

function parseXmlDoctypeTag(txt: string): XmlDoctype | undefined {
  return parseDtdEntityTag(txt)
}

function getXmlDoctypes(txt: string): Array<XmlDoctype> {
  const entityTags = getXmlDoctypeTags(txt)
  const entities = entityTags
    .map((_) => parseXmlDoctypeTag(_))
    .filter((_) => _ !== undefined)
  return entities
}
