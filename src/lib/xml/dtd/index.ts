import { fetch, ResponseType } from '@tauri-apps/api/http'

// --------------------------------------------------------------------------

function get_xml_doctype_tags(txt: string): string[] {
  const re = /<!DOCTYPE.+?>/g
  return get_dtd_tags(txt, re)
}

function get_dtd_entity_tags(txt: string): string[] {
  const re = /<!ENTITY.+?>/g
  return get_dtd_tags(txt, re)
}

function get_dtd_attlist_tags(txt: string): string[] {
  const re = /<!ATTLIST.+?>/g
  return get_dtd_tags(txt, re)
}

function get_dtd_element_tags(txt: string): string[] {
  const re = /<!ELEMENT.+?>/g
  return get_dtd_tags(txt, re)
}

// --------------------------------------------------------------------------

function get_dtd_tags(txt: string, re: RegExp): string[] {
  const re_multispace = /(?:\s+)/g
  let tags = txt.replaceAll(re_multispace, ' ').match(re) as string[] | null

  tags = tags ? tags : []

  const _tags: string[] = []
  tags.forEach((tag) => {
    const _tag = tag
      .replace(/<!.+?\s+/, '')
      .replace('>', '')
      .trim()
    _tags.push(_tag)
  })
  tags = _tags

  return tags
}

// --------------------------------------------------------------------------

function parse_dtd_entity_txt(txt: string): DTDEntityRaw {
  const re =
    /(%)?(\s+)?(?<entity_name>[\w_]+)(\s+)((?<entity_pubsys>(PUBLIC|SYSTEM))(\s+))?(['"](?<entity_description>[-,/\s\w]+)['"](\s+))?((['"](?<entity_value>[\w#]+)['"])|(['"](?<entity_url>[-:./\s\w]+)['"]))/
  // <!ENTITY entity-name "entity-value">
  const m = txt.match(re)
  let g: DTDEntityRaw = {} as DTDEntityRaw
  if (m && m.groups) {
    g = m.groups as DTDEntityRaw
  }
  return g
}

function parse_dtd_attlist_txt(txt: string): DTDAttributeRaw {
  const re =
    /(?<element_name>[-_\w]+)\s+(?<attribute_name>[\w]+)\s+\((?<attribute_type>[-_\w\s|:]+)\)\s+"?(?<attribute_value>[-#_\w\s]+)"?/
  // <!ATTLIST element-name attribute-name attribute-type attribute-value>
  const m = txt.match(re)
  let g: DTDAttributeRaw = {} as DTDAttributeRaw
  if (m && m.groups) {
    g = m.groups as DTDAttributeRaw
    if (g.attribute_type) {
      g.attribute_type = g.attribute_type.replaceAll(/\s+/g, '')
    }
  }
  return g
}

function parse_dtd_element_txt(txt: string): DTDElementRaw {
  const re =
    /(?<element_name>[\w_-]+)\s+((?<category>[\w#%;]+)|\((?<element_content>[-|\s\w#%;,?*+()]+)\))/
  // <!ELEMENT element-name category>
  // <!ELEMENT element-name (element-content)>
  const m = txt.match(re)
  let g: DTDElementRaw = {} as DTDElementRaw
  if (m && m.groups) {
    g = m.groups as DTDElementRaw
    if (g.element_content) {
      g.element_content = g.element_content.replaceAll(/\s/g, '')
    }
  }
  return g
}

// --------------------------------------------------------------------------

function dtd_url(url: string, ref_url?: string) {
  const base_url = ref_url ? ref_url : 'https://www.ncbi.nlm.nih.gov/dtd/'
  return new URL(url, base_url)
}

function dtd_txt_download(
  url: string,
  ref_url?: string
): Promise<{ url: string; dtd_txt: string }> {
  url = dtd_url(url, ref_url).toString()
  const dtd_txt_promise = fetch<ResponseType.Text>(url, {
    method: 'GET',
    responseType: ResponseType.Text
  }).then((res) => {
    if (res.ok) {
      return { url: url, dtd_txt: res.data.toString() }
    } else {
      // return null
      throw new Error(`fetch(): ${url} (${res.status})`)
    }
  })

  dtd_txt_promise.then((rslt) => {
    if (rslt) {
      const { url, dtd_txt } = rslt
      // const cache_key = 'cache-dtds'
      // const cache = localStorage.getItem(cache_key)
      // const dtds: { [url: string]: string } = cache ? JSON.parse(cache) : {}
      // dtds[url] = dtd_txt
      // localStorage.setItem(cache_key, JSON.stringify(dtds))
      // console.log('DTD added to cache:', url)
    }
  })

  return dtd_txt_promise
}

function dtd_txt_from_cache(url: string, ref_url?: string): string | null {
  url = dtd_url(url, ref_url).toString()

  // const cache_key = 'cache-dtds'
  // const cache = localStorage.getItem(cache_key)
  // const dtds: { [url: string]: string } = cache ? JSON.parse(cache) : {}
  // const dtd_urls = dtds ? Object.getOwnPropertyNames(dtds).sort() : []

  let dtd_txt: string | null = null

  // if (dtd_urls.includes(url)) {
  //   console.log(`DTD cache hit: ${url}`)
  //   dtd_txt = dtds[url]
  // } else {
  //   console.log(`DTD cache miss: ${url}`)
  // }

  return dtd_txt
}

// --------------------------------------------------------------------------

async function _parse_dtd_txt(txt: string, ref_url?: string): DTDRawPromise {
  // console.log(`>>> _parse_dtd BEGIN${ref_url ? ': ' + ref_url : ''}`)

  const dcts = get_xml_doctype_tags(txt)
  const ents = get_dtd_entity_tags(txt)
  const atts = get_dtd_attlist_tags(txt)
  const eles = get_dtd_element_tags(txt)

  const dcts_ents = [...dcts, ...ents]

  let doctypes_merged: DTDEntityRaw[] = []
  let entities_merged: DTDEntityRaw[] = []
  let attributes_merged: DTDAttributeRaw[] = []
  let elements_merged: DTDElementRaw[] = []

  const dtd_txts_ready: { url: string; dtd_txt: string }[] = []
  const dtd_txts_prom: Promise<{ url: string; dtd_txt: string } | null>[] = []
  const dtd_txts: ({ url: string; dtd_txt: string } | null)[] = []

  dcts_ents.forEach(async (e) => {
    const item = parse_dtd_entity_txt(e)
    const name = item['entity_name']
    const value = item['entity_value']
    const url = item['entity_url']
    if (!value && name && url) {
      const dtd_txt: string | null = dtd_txt_from_cache(url, ref_url)
      if (dtd_txt) {
        dtd_txts_ready.push({ url: url, dtd_txt: dtd_txt })
      } else {
        const dtd_txt_prom = dtd_txt_download(url, ref_url)
        dtd_txts_prom.push(dtd_txt_prom)
        dtd_txts.push(await dtd_txt_prom)
      }
    }
  })

  await Promise.allSettled(dtd_txts_prom)

  dtd_txts.forEach((val) => {
    if (val) {
      const { url, dtd_txt } = val
      dtd_txts_ready.push({ url: url, dtd_txt: dtd_txt })
    }
  })

  dcts.forEach((d) => {
    doctypes_merged.push(parse_dtd_entity_txt(d))
  })

  ents.forEach((e) => {
    const ent = parse_dtd_entity_txt(e)
    const name = ent['entity_name']
    const value = ent['entity_value']
    if (value && name) {
      entities_merged.push(ent)
    }
  })

  atts.forEach((a) => {
    attributes_merged.push(parse_dtd_attlist_txt(a))
  })

  eles.forEach((e) => {
    elements_merged.push(parse_dtd_element_txt(e))
  })

  const prom_raw_dtds: DTDRawPromise[] = []
  const raw_dtds: DTDRaw[] = []

  dtd_txts_ready.forEach(async ({ url, dtd_txt }) => {
    const parsed_dtd_prom = _parse_dtd_txt(dtd_txt, url)
    prom_raw_dtds.push(parsed_dtd_prom)
    raw_dtds.push(await parsed_dtd_prom)
  })

  await Promise.allSettled(prom_raw_dtds)

  raw_dtds.forEach((dtd) => {
    doctypes_merged = [...doctypes_merged, ...dtd.doctypes]
    entities_merged = [...entities_merged, ...dtd.entities]
    attributes_merged = [...attributes_merged, ...dtd.attributes]
    elements_merged = [...elements_merged, ...dtd.elements]
  })

  // console.log('Doctypes', doctypes_merged.length)
  // console.log('Entities', entities_merged.length)
  // console.log('Attributes', attributes_merged.length)
  // console.log('Elements', elements_merged.length)

  // console.log(`>>> _parse_dtd DONE${ref_url ? ': ' + ref_url : ''}`)

  return {
    doctypes: doctypes_merged,
    entities: entities_merged,
    attributes: attributes_merged,
    elements: elements_merged
  }
}

export async function parse_dtd_url(url: string) {
  url = dtd_url(url).toString()
  const txt = await fetch<ResponseType.Text>(url, {
    method: 'GET',
    responseType: ResponseType.Text
  }).then((r) => r.data.toString())

  return await parse_dtd_txt(txt, url)
}

export async function parse_dtd_txt(txt: string, ref_url?: string) {
  // console.log(`>>> parse_dtd BEGIN ----------------------------------------`)
  const raw_dtd = await _parse_dtd_txt(txt, ref_url)

  const doctypes: { [entity_name: string]: DTDEntityRaw } = {}
  const entities: { [entity_name: string]: DTDEntityRaw } = {}
  const attributes: { [element_name: string]: DTDAttributeRaw } = {}
  const elements: { [element_name: string]: DTDElementRaw } = {}

  raw_dtd.doctypes.forEach((dt) => {
    doctypes[dt.entity_name] = dt
  })

  raw_dtd.entities.forEach((en) => {
    entities[en.entity_name] = en
  })

  raw_dtd.attributes.forEach((at) => {
    attributes[at.element_name] = at
  })

  const attributes_parsed: { [element_name: string]: _dtd_attribute[] } = {}
  raw_dtd.attributes.forEach((at) => {
    const _ = parse_dtd_attlist_raw(at)
    attributes_parsed[at.element_name] = _
  })

  raw_dtd.elements.forEach((el) => {
    elements[el.element_name] = el
  })

  const element_names = new Set(Object.getOwnPropertyNames(elements))
  const elements_parsed: { [element_name: string]: _dtd_element } = {}
  raw_dtd.elements.forEach((el) => {
    const _ = parse_dtd_element_raw(el, element_names, attributes_parsed)
    elements_parsed[el.element_name] = _
  })

  // console.log('Doctypes', raw_dtd.doctypes.length)
  // console.log(doctypes)
  // console.log('Entities', raw_dtd.entities.length)
  // console.log(entities)
  // console.log('Attributes', raw_dtd.attributes.length)
  // console.log(attributes)
  // console.log('Elements', raw_dtd.elements.length)
  // console.log(elements)

  // console.log(elements_parsed)

  // console.log(`>>> parse_dtd DONE -----------------------------------------`)
  return elements_parsed
}

interface Required {
  [key: string]: string
}

// const required: Required = {
//   '?': 'ZERO_OR_ONE',
//   '*': 'ZERO_OR_MANY',
//   '+': 'ONE_OR_MANY'
// }

const required: Required = {
  '?': 'OPTIONAL',
  '*': 'ARRAY',
  '+': 'ONE_OR_MANY'
}

interface ElementValueType {
  [key: string]: string
}

export const element_value_type: ElementValueType = {
  '%INTEGER;': 'number',
  '%REAL;': 'number',
  '#PCDATA': 'string'
}

function parse_dtd_element_raw(
  e: DTDElementRaw,
  element_names: Set<string>,
  attributes: { [element_name: string]: _dtd_attribute[] }
): _dtd_element {
  const rv: _dtd_element = {
    children: null,
    value: null,
    attributes: null
  }

  if (e.element_name in attributes) {
    if (!rv['attributes']) {
      rv['attributes'] = {}
    }

    for (let i = 0; i < attributes[e.element_name].length; i++) {
      const att = attributes[e.element_name][i]
      rv['attributes'][att.name] = {
        type: att.type,
        value: att.value,
        possible_values: att.possible_values
      }
    }
  }

  if (e.element_content) {
    const content = e.element_content
    const content_parts = content.split(',')

    let content_options: string[] = []
    content_parts.forEach((content_part) => {
      content_options = [...content_options, ...content_part.split('|')]
    })

    const content_parts_options = [...content_parts, ...content_options]

    content_parts_options.forEach((content_part) => {
      let content_part_required: string = 'REQUIRED'
      const last_char = content_part[content_part.length - 1]
      if (last_char in required) {
        content_part = content_part.slice(0, content_part.length - 1)
        content_part_required = required[last_char]
      }

      if (element_names.has(content_part)) {
        if (!rv['children']) {
          rv['children'] = {}
        }
        rv['children'][content_part] = {
          type: 'element',
          required: content_part_required
        }
      } else if (content_part in element_value_type) {
        rv['value'] = {
          type: content_part,
          required: content_part_required
        }
      }
    })
  }
  return rv
}

function parse_dtd_attlist_raw(a: DTDAttributeRaw): _dtd_attribute[] {
  // ToDo: Incomplete; each entry can contain multiple attributes.
  // https://www.w3schools.com/xml/xml_dtd_examples.asp
  const possible_values = a.attribute_type.split('|')
  const _ = new Set(possible_values)
  let type = 'string'
  if (_.has('true') && _.has('false')) {
    type = 'boolean'
  }

  return [
    {
      element_name: a.element_name,
      name: a.attribute_name,
      type: type,
      value: a.attribute_value,
      possible_values: possible_values
    }
  ]
}
