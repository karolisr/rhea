import { parse_dtd_txt, parse_dtd_url, element_value_type } from './dtd'

// ToDo: create_parent_object_for_arrays type problems.
function _parse_xml(
  ele: Document | Element,
  dtd: { [element_name: string]: _dtd_element },
  obj: { [key: string]: unknown },
  parent_element_name?: string,
  create_parent_object_for_arrays: boolean = false
) {
  for (let i = 0; i < ele.children.length; i++) {
    const doc_element = ele.children[i]
    const doc_element_name = doc_element.tagName

    let obj_local = {} as { [key: string]: unknown }
    obj_local[doc_element_name] = {}
    obj_local = obj_local[doc_element_name] as { [key: string]: unknown }

    if (create_parent_object_for_arrays) {
      if (
        parent_element_name &&
        obj[parent_element_name] &&
        obj[parent_element_name][doc_element_name] &&
        obj[parent_element_name][doc_element_name] instanceof Array
      ) {
        obj[parent_element_name][doc_element_name].push(obj_local)
      } else {
        obj_local = obj
      }
    } else {
      if (
        parent_element_name &&
        obj[parent_element_name] &&
        obj[parent_element_name] instanceof Array
      ) {
        ;(obj[parent_element_name] as object[]).push(obj_local)
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
              obj_local[doc_element_name] = {}
              obj_local[doc_element_name][child_element_spec_name] = []
            } else {
              obj_local[doc_element_name] = []
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
        obj_local[doc_element_name] = value
      }

      if (element_spec.attributes) {
        for (let i = 0; i < doc_element.attributes.length; i++) {
          const att = doc_element.attributes[i]
          let att_value: string | boolean = att.value
          if (att.name in element_spec.attributes) {
            const att_type = element_spec.attributes[att.name].type
            if (att_type === 'boolean') {
              att_value = att_value === 'true' ? true : false
            }
          }
          if (att.name === 'value') {
            obj_local[doc_element_name] = att_value
          } else {
            if (!obj_local[doc_element_name]) {
              obj_local[doc_element_name] = {}
              obj_local[doc_element_name]['attributes'] = {}
            }
            obj_local[doc_element_name]['attributes'][att.name] = att_value
          }
        }
      }
    }
  }
  return obj
}

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

  if (Object.getOwnPropertyNames(dtd).length === 0) {
    const doc_element = doc.children[0]
    const doc_element_name = doc_element.nodeName

    if (doc_element_name in DTD_MAP) {
      dtd = await parse_dtd_url(DTD_MAP[doc_element_name])
    }

    if (Object.getOwnPropertyNames(dtd).length === 0) {
      throw new Error(`No DTD for: ${doc_element_name}`)
    }
  }

  // console.log(`>>> parse_xml BEGIN ----------------------------------------`)
  const ret_val = _parse_xml(
    doc,
    dtd,
    {},
    undefined,
    create_parent_object_for_arrays
  )
  // console.log(ret_val)
  // console.log(`>>> parse_xml DONE -----------------------------------------`)
  return ret_val
}
