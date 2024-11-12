export type { XmlDoctype }
export { getXmlDoctypes }

import { parseDtdEntityTag } from '../dtd/dtd-entity'
import { getDtdTags } from '../dtd/dtd-common'

interface XmlDoctype {
  name: string
  value: string
  external: string | undefined
}

function getXmlDoctypeTags(txt: string): string[] {
  return getDtdTags(txt, 'doctype')
}

async function parseXmlDoctypeTag(
  txt: string
): Promise<XmlDoctype | undefined> {
  return await parseDtdEntityTag(txt, 'XML')
}

async function getXmlDoctypes(txt: string): Promise<Array<XmlDoctype>> {
  const entityTags = getXmlDoctypeTags(txt)
  // const entities = entityTags
  //   .map((_) => parseXmlDoctypeTag(_))
  //   .filter((_) => _ !== undefined)
  const entityPromises = entityTags.map((_) => parseXmlDoctypeTag(_))
  const entities: Array<XmlDoctype> = []
  for await (const en of entityPromises) {
    if (en !== undefined) {
      entities.push(en)
    }
  }
  return entities
}
