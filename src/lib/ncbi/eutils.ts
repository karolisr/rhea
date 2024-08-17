import { appSettings } from '$lib/stores/settings'
import { EutilParams } from './eutils-params'
import {
  Eutil,
  RetMode,
  RetContentType,
  RetTypeESearch,
  IdType,
  NCBIDatabase,
  type ESummaryJSON,
  type ESummary,
  type History
} from '.'

import { parseXmlText } from '$lib/xml'

const min = Math.min

function findApiKey(): string | undefined {
  let ncbi_api_key: string | undefined
  const unsubscribe = appSettings.subscribe((stng) => {
    ncbi_api_key = stng.ncbi_api_key ? stng.ncbi_api_key : undefined
  })
  unsubscribe()
  return ncbi_api_key
}

function findEmail(): string | undefined {
  let email: string | undefined
  const unsubscribe = appSettings.subscribe((stng) => {
    email = stng.email ? stng.email : undefined
  })
  unsubscribe()
  return email
}

const EutilsBaseURL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
const EutilsRetMax = 500

async function eutil(util: Eutil, params: EutilParams): Promise<Response> {
  params.tool = 'is.karol.rhea'
  params.api_key = findApiKey()
  params.email = findEmail()

  if (!params.api_key) {
    throw new Error(
      'NCBI API Key is not defined. Go to the "Setting" tab and add your NCBI API key.'
    )
  }

  const url: string = EutilsBaseURL + util
  const request: Request = new Request(url, {
    method: 'POST',
    body: new URLSearchParams(params.toObject())
  })
  return await fetch(request)
}

function _batch(params: EutilParams): void {
  if (params.usehistory === undefined) {
    params.last = true
  } else {
    params.last = false
  }
  if (params.retmax === undefined || Number.isNaN(params.retmax)) {
    params.retmax = EutilsRetMax
  }
  if (params.retstart === undefined) {
    params.retstart = 0
  } else {
    params.retstart += params.retmax
  }
  const remaining = (params.count as number) - params.retstart
  params.retmax = Math.min(remaining, EutilsRetMax)
  if (params.retstart + params.retmax == params.count) {
    params.last = true
  }
}

async function _batched(
  f: (params: EutilParams) => Promise<object>,
  params: EutilParams
): Promise<object[]> {
  const return_value: object[] = []
  while (!params.last) {
    _batch(params)
    return_value.push(await f(params))
  }
  return return_value
}

function retContentType(ct: string): RetContentType {
  const re_xml = /(xml)/
  const re_json = /(json)/

  const xml = ct.match(re_xml)
  const json = ct.match(re_json)

  if (xml) return RetContentType.xml
  if (json) return RetContentType.json

  return RetContentType.text
}

async function processResponse(response: Response): Promise<object> {
  let data = {}
  let xmlText = ''
  const ct: string = response.headers.get('Content-Type') as string
  switch (retContentType(ct)) {
    case RetContentType.text:
      data = await response.text()
      break
    case RetContentType.xml:
      xmlText = await response.text()
      data = (await parseXmlText(xmlText)) as object
      break
    case RetContentType.json:
      data = await response.json()
      break
    default:
      break
  }
  return data
}

async function _esummary(params: EutilParams): Promise<ESummaryJSON> {
  params.retmode = RetMode.json
  params.version = '2.0'
  const result = await eutil(Eutil.esummary, params).then((r) =>
    processResponse(r)
  )
  const rv = result as ESummaryJSON
  if (rv.esummaryresult && rv.esummaryresult[0].startsWith('Empty')) {
    rv.result = {
      uids: []
    }
  }
  return rv
}

export async function esummary(params: EutilParams): Promise<ESummary[]> {
  const results = (await _batched(_esummary, params)) as ESummaryJSON[]
  const results_combined: object[] = []
  results.forEach((esr) => {
    if (esr.result.uids)
      esr.result.uids.forEach((uid) => {
        const esrRecord = esr.result[uid]
        results_combined.push(esrRecord)
      })
  })
  return results_combined as ESummary[]
}

async function _efetch(params: EutilParams): Promise<object> {
  const result = await eutil(Eutil.efetch, params).then((r) =>
    processResponse(r)
  )
  return result
}

export async function efetch(params: EutilParams): Promise<object> {
  if (
    params.usehistory === 'y' &&
    params.query_key &&
    params.WebEnv &&
    params.count &&
    params.count > EutilsRetMax
  ) {
    return await _batched(_efetch, params) // ToDo: Untested.
  } else {
    return [await _efetch(params)]
  }
}

export async function esearch(
  db: keyof typeof NCBIDatabase,
  term: string,
  usehistory: boolean
): Promise<{
  data: object
  params: EutilParams
}> {
  const p = new EutilParams()
  p.db = db
  p.term = term
  p.rettype = RetTypeESearch.uilist
  p.retmode = RetMode.json
  p.usehistory = usehistory ? 'y' : undefined
  p.idtype = IdType.acc
  const response = await eutil(Eutil.esearch, p)
  const data = (await processResponse(response)) as {
    esearchresult: History
  }
  // Hard limit max results for now.
  // p.count = Number(data.esearchresult.count)
  p.count = min(Number(data.esearchresult.count), 100)
  p.retmax = undefined
  p.retstart = undefined
  p.query_key = data.esearchresult.querykey
  p.WebEnv = data.esearchresult.webenv
  p.term = undefined
  p.rettype = undefined
  p.retmode = undefined
  return {
    data: data,
    params: p
  }
}
