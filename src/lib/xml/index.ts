import type { Indexed } from '$lib/types'
import { parseDtdText, parseDtdAtUrl, eleValType } from './dtd'

type Complicated = string | number | boolean | Indexed | Indexed[] | null

// ToDo: create_parent_object_for_arrays type problems.
function _parse_xml(
  ele: Document | Element,
  dtd: { [eleName: string]: _dtd_element },
  obj: { [key: string]: Complicated },
  parentEleName?: string,
  createParentObjForArrays: boolean = false
) {
  const pen = parentEleName?.replaceAll('-', '_').replaceAll('INSD', 'GB')
  for (let i = 0; i < ele.children.length; i++) {
    const docEle = ele.children[i]
    const docEleName = docEle.tagName
    const den = docEleName.replaceAll('-', '_').replaceAll('INSD', 'GB')

    let objLocal: { [key: string]: Complicated } = {}
    objLocal[den] = {}
    objLocal = objLocal[den] as { [key: string]: Complicated }

    if (createParentObjForArrays) {
      if (pen && obj[pen] && (obj[pen] as Indexed)[den]) {
        const _ = (obj[pen] as Indexed)[den] as Array<Indexed>
        _.push(objLocal)
      } else {
        objLocal = obj
      }
    } else {
      if (pen && obj[pen] && obj[pen] instanceof Array) {
        ;(obj[pen] as object[]).push(objLocal)
      } else {
        objLocal = obj
      }
    }

    if (docEleName in dtd) {
      const eleSpec = dtd[docEleName]
      if (eleSpec.children) {
        const cks = Object.getOwnPropertyNames(eleSpec.children)
        for (let i = 0; i < cks.length; i++) {
          const childEleSpecName = cks[i]
          const c = eleSpec.children[childEleSpecName]
          if (c.required === 'ARRAY') {
            if (createParentObjForArrays) {
              objLocal[den] = {}
              objLocal[den][
                childEleSpecName.replaceAll('-', '_').replaceAll('INSD', 'GB')
              ] = []
            } else {
              objLocal[den] = []
            }
          }
        }
        _parse_xml(docEle, dtd, objLocal, docEleName, createParentObjForArrays)
      } else if (eleSpec.value) {
        let value: string | null | number = docEle.textContent
        if (eleSpec.value.type in eleValType) {
          const type = eleValType[eleSpec.value.type]
          if (type === 'number') {
            value = Number(value)
          }
        }
        objLocal[den] = value
      }

      if (eleSpec.attributes) {
        for (let i = 0; i < docEle.attributes.length; i++) {
          const attr = docEle.attributes[i]
          let attrVal: string | boolean = attr.value
          if (attr.name in eleSpec.attributes) {
            const attrType = eleSpec.attributes[attr.name].type
            if (attrType === 'boolean') {
              attrVal = attrVal.toLowerCase() === 'true' ? true : false
            }
          }
          if (attr.name === 'value') {
            objLocal[den] = attrVal
          } else {
            if (!objLocal[den]) {
              objLocal[den] = {}
              objLocal[den]['attributes'] = {}
            }
            ;((objLocal[den] as Indexed)['attributes'] as Indexed)[attr.name] =
              attrVal
          }
        }
      }
    }
  }
  return obj
}

// These are only necessary when the XML file does not reference a DTD.
const DtdMap: { [element_name: string]: string } = {
  'Bioseq-set': 'NCBI_Seqset.dtd',
  'INSDSet': 'INSD_INSDSeq.dtd'
}

export async function parseXmlText(
  txt: string,
  createParentObjForArrays: boolean = false
) {
  let dtd: { [eleName: string]: _dtd_element } | null

  const dp = new DOMParser()
  const doc: Document = dp.parseFromString(txt, 'text/xml')

  const docEle = doc.children[0]
  const docEleName = docEle.nodeName

  if (docEleName in DtdMap) {
    dtd = await parseDtdAtUrl(DtdMap[docEleName])
  } else {
    dtd = await parseDtdText(txt)
  }

  if (!dtd) {
    throw new Error(`No DTD for: ${docEleName}`)
  }

  let rv = _parse_xml(
    doc,
    dtd,
    {},
    undefined,
    createParentObjForArrays
  ) as Indexed

  const rootEleName = docEleName.replaceAll('-', '_').replaceAll('INSD', 'GB')

  if (!(rootEleName in rv)) {
    let _ = {} as { [key: string]: unknown }
    _[rootEleName] = rv
    rv = _ as Indexed
  }

  return rv[rootEleName]
}
