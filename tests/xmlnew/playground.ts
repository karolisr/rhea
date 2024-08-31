#!/usr/bin/env -S npx tsx
// console.log('argv:', process.argv.slice(2))

import { readFileSync } from 'fs'
import { carriageReturnToNewLine } from '$lib/xmlnew/dtd/utils'
import { parseDtdTxt } from '$lib/xmlnew/dtd'

let dtdTxtESummNC: string = readFileSync('data/esummary_nuccore.dtd', 'utf8')
let xmlTxtESummNC: string = readFileSync('data/esummary_nuccore.xml', 'utf8')
let dtdTxtNCBIGBS: string = readFileSync('data/NCBI_GBSeq.dtd', 'utf8')
let xmlTxtNCBIGBS: string = readFileSync('data/NCBI_GBSeq.xml', 'utf8')
let dtdTxtNCBIEntMod: string = readFileSync('data/NCBI_Entity.mod.dtd', 'utf8')
let dtdTxtNCBIGBSMod: string = readFileSync('data/NCBI_GBSeq.mod.dtd', 'utf8')

// let attLstTxt = `
// <!ATTLIST element-name
//     attr-name attr-type "value"
//     attr-name attr-type #FIXED "value"
//     attr-name attr-type #REQUIRED
//     attr-name attr-type #IMPLIED>

// <!ATTLIST square width CDATA "0">
// <!ATTLIST payment type (check|cash) "cash">
// <!ATTLIST element-name attribute-name (en1|en2|en3) "default-value">

// <!ATTLIST PRODUCT
//     NAME CDATA #IMPLIED
//     CATEGORY (HandTool|Table|Shop-Professional) "HandTool"
//     PARTNUM CDATA #IMPLIED
//     PLANT (Pittsburgh|Milwaukee|Chicago) "Chicago"
//     INVENTORY (InStock| Backordered| Discontinued ) "InStock">

// <!ATTLIST SPECIFICATIONS
//     WEIGHT CDATA #IMPLIED
//     POWER CDATA #IMPLIED>

// <!ATTLIST PRICE
//     MSRP CDATA #IMPLIED
//     WHOLESALE CDATA #IMPLIED
//     STREET CDATA #IMPLIED
//     SHIPPING CDATA #IMPLIED>

// <!ATTLIST OPTIONS
//     FINISH (Metal|Polished|Matte) "Matte"
//     ADAPTER (Included|Optional|NotApplicable) "Included"
//     CASE (HardShell|Soft|NotApplicable) "HardShell">

// <!ATTLIST person
//     id ID #REQUIRED
//     mother IDREF #IMPLIED
//     father IDREF #IMPLIED
//     children IDREFS #IMPLIED>
// `

let concatTxt =
  xmlTxtESummNC +
  xmlTxtNCBIGBS +
  // attLstTxt +
  dtdTxtESummNC +
  dtdTxtNCBIGBS +
  dtdTxtNCBIEntMod +
  dtdTxtNCBIGBSMod

const txt = carriageReturnToNewLine(concatTxt)
const result = parseDtdTxt(txt)

// console.table(result.doctypes)
// console.log(result.entities)
// console.table(result.attributes)
// console.log(result.elements)
