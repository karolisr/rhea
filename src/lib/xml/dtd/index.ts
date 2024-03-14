import {
  cache_get_dtd_txt,
  dnld_dtd_txt,
  type _DTD_TXT
} from '$lib/app/svelte-stores/cache-dtd'

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
    /(%?\s+?)(?<entity_name>[\w_]+)(\s+)((?<entity_pubsys>(PUBLIC|SYSTEM))(\s+))?(['"](?<entity_description>[-,./\s\w]+)['"](\s+))?((['"](?<entity_value>[()\s|\w#]+)['"])|(['"](?<entity_url>[-:./\s\w]+)['"]))/
  // <!ENTITY entity-name "entity-value">
  const m = txt.match(re)
  let g: DTDEntityRaw = {} as DTDEntityRaw
  if (m && m.groups) {
    g = m.groups as DTDEntityRaw
    if (g.entity_value) {
      g.entity_value = g.entity_value.replaceAll(/\s/g, '')
    }
  }
  return g
}

function parse_dtd_attlist_txt(txt: string) {
  // <!ATTLIST element-name attribute-name attribute-type attribute-value>
  // <!ATTLIST element-name
  //     attribute-name attribute-type attribute-value
  //     attribute-name attribute-type #FIXED "abcdef"
  //     attribute-name attribute-type #REQUIRED
  // >
  // <!ATTLIST Item
  //     Name CDATA #REQUIRED
  //     Type (Integer|Date|Flags|Qualifier|Enumerator|Unknown) #REQUIRED
  // >
  const en = /[^\s]+/.source
  const _ = txt.match(en)
  const element_name = _?.length === 1 ? _[0] : null
  if (element_name === null) throw new Error('No element name.')

  const an = /(?<attribute_name>[^\s()]+)\s+/.source
  const at = /(?<attribute_type>\(.+?\)|[^\s()]+)\s+/.source
  const av = /(?<attribute_value>(#FIXED\s+[^\s()]+)|((?=[#'"])[^\s()]+))/
    .source

  const ntv = an + at + av
  const re = RegExp(`(?:${en}\\s)?(?:${ntv})`, 'g')
  const match_groups = [...txt.matchAll(re)].map((i) => i.groups)

  let attrs: _dtd_attribute[] = []
  match_groups.forEach((mg) => {
    if (mg) {
      const attr = mg as DTDAttributeRaw
      if (attr.attribute_type) {
        attr.element_name = element_name
        attr.attribute_type = attr.attribute_type.replaceAll(/[\s()]/g, '')
      }
      attrs.push(parse_dtd_att_raw(attr))
    }
  })

  return attrs
}

function parse_dtd_att_raw(a: DTDAttributeRaw): _dtd_attribute {
  const possible_values = a.attribute_type.split('|')
  const _ = new Set(possible_values)
  let type = 'string'
  if (_.has('true') && _.has('false')) {
    type = 'boolean'
  }

  return {
    element_name: a.element_name,
    name: a.attribute_name,
    type: type,
    value: a.attribute_value,
    possible_values: possible_values
  }
}

function parse_dtd_element_txt(txt: string): DTDElementRaw {
  // <!ELEMENT element-name category>
  // <!ELEMENT element-name (element-content)>
  // But see PLIST spec too, not quite the same.
  const re =
    /(?<element_name>[\w_-]+)\s+((?<category>[\w#%;]+)|\((?<element_content>[-|\s\w#%;,?*+()]+)\))/
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

async function _parse_dtd_txt(txt: string, ref_url?: string): DTDRawPromise {
  const dcts = get_xml_doctype_tags(txt)
  const ents = get_dtd_entity_tags(txt)
  const atts = get_dtd_attlist_tags(txt)
  const eles = get_dtd_element_tags(txt)

  let doctypes_merged: DTDEntityRaw[] = []
  let entities_merged: DTDEntityRaw[] = []
  let attributes_merged: _dtd_attribute[] = []
  let elements_merged: DTDElementRaw[] = []

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
    attributes_merged = [...attributes_merged, ...parse_dtd_attlist_txt(a)]
  })

  eles.forEach((e) => {
    elements_merged.push(parse_dtd_element_txt(e))
  })

  const dtd_txts_prom: Promise<_DTD_TXT>[] = []
  const dtd_txts: _DTD_TXT[] = []

  const dcts_ents = [...dcts, ...ents]

  dcts_ents.forEach(async (e) => {
    const item = parse_dtd_entity_txt(e)
    const name = item['entity_name']
    const value = item['entity_value']
    const url = item['entity_url']
    if (!value && name && url) {
      const dtd_txt: _DTD_TXT | null = cache_get_dtd_txt(url, ref_url)
      if (dtd_txt) {
        dtd_txts.push(dtd_txt)
      } else {
        const dtd_txt_prom = dnld_dtd_txt(url, ref_url)
        dtd_txts_prom.push(dtd_txt_prom)
        dtd_txts.push(await dtd_txt_prom)
      }
    }
  })

  const raw_dtds_prom: DTDRawPromise[] = []
  const raw_dtds: DTDRaw[] = []

  await Promise.allSettled(dtd_txts_prom)
  dtd_txts.forEach(async (_) => {
    const raw_dtd_prom = _parse_dtd_txt(_.data, _.url)
    raw_dtds_prom.push(raw_dtd_prom)
    raw_dtds.push(await raw_dtd_prom)
  })

  await Promise.allSettled(raw_dtds_prom)
  raw_dtds.forEach((raw_dtd) => {
    doctypes_merged = [...doctypes_merged, ...raw_dtd.doctypes]
    entities_merged = [...entities_merged, ...raw_dtd.entities]
    attributes_merged = [...attributes_merged, ...raw_dtd.attributes]
    elements_merged = [...elements_merged, ...raw_dtd.elements]
  })

  return {
    doctypes: doctypes_merged,
    entities: entities_merged,
    attributes: attributes_merged,
    elements: elements_merged
  }
}

export async function parse_dtd_at_url(url: string) {
  let dtd_txt: _DTD_TXT | null = cache_get_dtd_txt(url)
  if (!dtd_txt) {
    dtd_txt = await dnld_dtd_txt(url)
  }
  return await parse_dtd_txt(dtd_txt.data, dtd_txt.url)
}

export async function parse_dtd_txt(txt: string, ref_url?: string) {
  const raw_dtd = await _parse_dtd_txt(txt, ref_url)

  const doctypes: { [entity_name: string]: DTDEntityRaw } = {}
  const entities: { [entity_name: string]: DTDEntityRaw } = {}
  const attributes: { [element_name: string]: _dtd_attribute[] } = {}
  const elements: { [element_name: string]: _dtd_element } = {}

  raw_dtd.doctypes.forEach((dt) => {
    doctypes[dt.entity_name] = dt
  })

  raw_dtd.entities.forEach((en) => {
    entities[en.entity_name] = en
  })

  raw_dtd.attributes.forEach((at) => {
    if (!attributes[at.element_name]) attributes[at.element_name] = []
    attributes[at.element_name].push(at)
  })

  const element_names = new Set<string>()
  raw_dtd.elements.forEach((el) => {
    element_names.add(el.element_name)
  })

  raw_dtd.elements.forEach((el) => {
    const _ = parse_dtd_element_raw(el, element_names, attributes)
    elements[el.element_name] = _
  })

  return elements
}

interface Required {
  [key: string]: string
}

const required: Required = {
  '?': 'OPTIONAL',
  '*': 'ARRAY',
  '+': 'ARRAY'
}

interface ElementValueType {
  [key: string]: string
}

export const element_value_type: ElementValueType = {
  '%INTEGER;': 'number',
  '%REAL;': 'number',
  '%OCTETS;': 'string',
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
    // This is a dirty shortcut, since we are not verifying that the XML
    // meets the spec, we simply want to know all possible elements that
    // may be found. Should, technically, be parsing recursively within
    // each part enclosed in parentheses.
    const content = e.element_content.replaceAll(/[()]/g, '')
    // const content = e.element_content

    const content_parts = content.split(',')

    let content_options: string[] = []
    content_parts.forEach((content_part) => {
      // ----------------------------------------------------------------------
      // const re_entity = /(?<=%).+(?=;)/
      // const m = content_part.match(re_entity)
      // if (m && m.length === 1) {
      //   content_part = entities[m[0]].entity_value.replaceAll(/[()]/g, '')
      // }
      // ----------------------------------------------------------------------
      content_options = [...content_options, ...content_part.split('|')]
    })

    // const content_parts_options = [...content_parts, ...content_options]
    const content_parts_options = [...content_options]

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
      } else {
        console.warn(
          `ENTITY or ELEMENT referenced in "${e.element_name}" was not found:`,
          content_part
        )
      }
    })
  }
  return rv
}
