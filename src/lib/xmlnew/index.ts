export { parseXmlTxt }

import jsdom from 'jsdom'
const { JSDOM } = jsdom

import { getXmlDoctypes } from './xml/xml-doctype'
import { downloadDtd } from '$lib/stores/dtd-cache'
import { getDtd } from '$lib/stores/dtd-cache'
import type { DtdText } from '$lib/stores'
import { parseDtdTxt } from './dtd'
import type { XmlDoctype } from './xml/xml-doctype'
import type { DtdElement } from './dtd/dtd-element'

async function parseXmlEle(
  ele: Element,
  dtdEles: { [eleName: string]: DtdElement },
  level: number = 0
) {
  const eleName = ele.nodeName
  let dtdEle: DtdElement | null = null

  if (eleName in dtdEles) {
    dtdEle = dtdEles[eleName]
  }

  if (dtdEle !== null) {
    console.info(''.padStart(2 * level) + `${eleName}`)
    for (let i = 0; i < dtdEle.attributes.length; i++) {
      const attrDtd = dtdEle.attributes[i]
      const attrName = attrDtd.name
      const attr: Attr | null = ele.attributes.getNamedItem(attrName)
      if (attr !== null) {
        console.info(
          ''.padStart(2 * (level + 1)) + `${attr.name}: ${attr.value}`
        )
      }
    }

    const children = [...ele.children]
    if (children.length > 0) {
      for (let i = 0; i < children.length; i++) {
        const chldEle = children[i]
        parseXmlEle(chldEle, dtdEles, level + 1)
      }
    } else if (ele.textContent !== null && ele.textContent.trim() !== '') {
      console.info(''.padStart(2 * (level + 1)) + `${ele.textContent.trim()}`)
    }
  }
}

async function parseXmlTxt(txt: string, txtDtd?: string) {
  const docTypes: XmlDoctype[] = await getXmlDoctypes(txt)
  let rootName: string = ''
  let dtdUrl: string = ''
  if (docTypes.length >= 1) {
    const _ = docTypes[0]
    rootName = _.name
    dtdUrl = _.value
  }

  let dtdTxt: DtdText | null = null
  let dtdEles: { [eleName: string]: DtdElement } = {}

  if (txtDtd !== undefined) {
    dtdTxt = { data: txtDtd, url: dtdUrl }
  } else if (dtdUrl !== '') {
    dtdTxt = getDtd(dtdUrl) || (await downloadDtd(dtdUrl, undefined, false))
  }

  if (dtdTxt !== null) {
    const _ = await parseDtdTxt(dtdTxt.data, dtdUrl)
    for (let i = 0; i < _.length; i++) {
      const e = _[i]
      dtdEles[e.name] = e
    }
  }

  const doc = new JSDOM(txt, { contentType: 'text/xml' }).window.document
  const docEle = doc.children[0]
  parseXmlEle(docEle, dtdEles)
}
