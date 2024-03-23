import type { Indexed } from '$lib/types'
import { parse_dtd_txt, parse_dtd_at_url, element_value_type } from './dtd'

// ToDo: create_parent_object_for_arrays type problems.
function _parse_xml(
  ele: Document | Element,
  dtd: { [element_name: string]: _dtd_element },
  obj: { [key: string]: unknown },
  parent_element_name?: string,
  create_parent_object_for_arrays: boolean = false
) {
  const pen = parent_element_name?.replaceAll('-', '_')
  for (let i = 0; i < ele.children.length; i++) {
    const doc_element = ele.children[i]
    const doc_element_name = doc_element.tagName
    const den = doc_element_name.replaceAll('-', '_')

    let obj_local = {} as { [key: string]: unknown }
    obj_local[den] = {}
    obj_local = obj_local[den] as { [key: string]: unknown }

    if (create_parent_object_for_arrays) {
      if (pen && obj[pen] && obj[pen][den] && obj[pen][den] instanceof Array) {
        obj[pen][den].push(obj_local)
      } else {
        obj_local = obj
      }
    } else {
      if (pen && obj[pen] && obj[pen] instanceof Array) {
        ;(obj[pen] as object[]).push(obj_local)
      } else {
        obj_local = obj
      }
    }

    if (doc_element_name in dtd) {
      const element_spec = dtd[doc_element_name]
      if (element_spec.children) {
        const cks = Object.getOwnPropertyNames(element_spec.children)
        for (let i = 0; i < cks.length; i++) {
          const child_element_spec_name = cks[i]
          const c = element_spec.children[child_element_spec_name]
          if (c.required === 'ARRAY') {
            if (create_parent_object_for_arrays) {
              obj_local[den] = {}
              obj_local[den][child_element_spec_name.replaceAll('-', '_')] = []
            } else {
              obj_local[den] = []
            }
          }
        }
        _parse_xml(
          doc_element,
          dtd,
          obj_local,
          doc_element_name,
          create_parent_object_for_arrays
        )
      } else if (element_spec.value) {
        let value: string | null | number = doc_element.textContent
        if (element_spec.value.type in element_value_type) {
          const type = element_value_type[element_spec.value.type]
          if (type === 'number') {
            value = Number(value)
          }
        }
        obj_local[den] = value
      }

      if (element_spec.attributes) {
        for (let i = 0; i < doc_element.attributes.length; i++) {
          const att = doc_element.attributes[i]
          let att_value: string | boolean = att.value
          if (att.name in element_spec.attributes) {
            const att_type = element_spec.attributes[att.name].type
            if (att_type === 'boolean') {
              att_value = att_value.toLowerCase() === 'true' ? true : false
            }
          }
          if (att.name === 'value') {
            obj_local[den] = att_value
          } else {
            if (!obj_local[den]) {
              obj_local[den] = {}
              obj_local[den]['attributes'] = {}
            }
            obj_local[den]['attributes'][att.name] = att_value
          }
        }
      }
    }
  }
  return obj
}

// These are only necessary when the XML file does not reference a DTD.
const DTD_MAP: { [element_name: string]: string } = {
  'Bioseq-set': 'NCBI_Seqset.dtd',
  'INSDSet': 'INSD_INSDSeq.dtd',
  'TaxaSet': 'https://www.ncbi.nlm.nih.gov/corehtml/query/DTD/taxon.dtd'
}

export async function parse_xml_txt(
  txt: string,
  create_parent_object_for_arrays: boolean = true
) {
  let dtd = await parse_dtd_txt(txt)
  const dp = new DOMParser()
  const doc: Document = dp.parseFromString(txt, 'text/xml')

  const doc_element = doc.children[0]
  const doc_element_name = doc_element.nodeName

  if (Object.getOwnPropertyNames(dtd).length === 0) {
    if (doc_element_name in DTD_MAP) {
      dtd = await parse_dtd_at_url(DTD_MAP[doc_element_name])
    }

    if (Object.getOwnPropertyNames(dtd).length === 0) {
      throw new Error(`No DTD for: ${doc_element_name}`)
    }
  }

  let ret_val = _parse_xml(
    doc,
    dtd,
    {},
    undefined,
    create_parent_object_for_arrays
  ) as Indexed

  const root_element_name = doc_element_name.replaceAll('-', '_')

  if (!(root_element_name in ret_val)) {
    let _ = {} as { [key: string]: unknown }
    _[root_element_name] = ret_val
    ret_val = _ as Indexed
  }

  return ret_val[root_element_name]
}
