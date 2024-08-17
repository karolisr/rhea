import { writable, derived, type Writable } from 'svelte/store'
import { downloadText } from '$lib/backend/download'
import type { DtdCache, DtdText } from '.'

// ----------------------------------------------------------------------------
const key = 'dtd-cache'

// ----------------------------------------------------------------------------
export const dtds = init()
export const dtdUrls = derived(dtds, ($dtds) =>
  $dtds ? Object.getOwnPropertyNames($dtds).sort() : []
)

// ----------------------------------------------------------------------------
function init(): Writable<DtdCache> {
  const _ = localStorage.getItem(key)
  let _dtds: DtdCache = {}
  if (_) {
    _dtds = JSON.parse(_)
  }
  return writable(_dtds)
}

// ----------------------------------------------------------------------------
function getDtdUrls(url: string, refUrl?: string): URL[] {
  const base_urls = [
    'https://www.ncbi.nlm.nih.gov/dtd/',
    'https://www.ncbi.nlm.nih.gov/entrez/query/DTD/',
    'https://www.ncbi.nlm.nih.gov/data_specs/dtd/other/entrez/',
    'https://www.ncbi.nlm.nih.gov/data_specs/dtd/',
    'https://www.nlm.nih.gov/databases/dtd/'
  ]
  const rv: URL[] = []

  url = url.replace('http:', 'https:')

  if (refUrl) {
    rv.push(new URL(url, refUrl))
  }

  base_urls.forEach((bu) => {
    rv.push(new URL(url, bu))
  })

  return rv
}

function addDtdToCache(url: string, txt: string): void {
  dtds.update((_dtds) => {
    _dtds[url] = txt
    localStorage.setItem(key, JSON.stringify(_dtds))
    return _dtds
  })
}

export function getDtd(url: string, refUrl?: string): DtdText | null {
  const urls = getDtdUrls(url, refUrl)
  let dtdTxt: DtdText | null = null

  for (const _url of urls) {
    const url = _url.toString()
    const unsubscribe = dtds.subscribe((_dtds) => {
      if (url in _dtds) {
        // console.info(`DTD cache hit: ${url}`)
        dtdTxt = {
          url: url,
          data: _dtds[url]
        }
      } else {
        // console.info(`DTD cache miss: ${url}`)
        dtdTxt = null
      }
    })
    unsubscribe()
    if (dtdTxt) break
  }

  return dtdTxt
}

export async function downloadDtd(
  url: string,
  refUrl?: string
): Promise<DtdText | null> {
  const urls = getDtdUrls(url, refUrl)
  let dtdTxt: {
    url: string
    data: string
  } | null = {
    url,
    data: ''
  }

  for (const _url of urls) {
    const url = _url.toString()
    dtdTxt = await downloadText(url)
    if (dtdTxt) {
      addDtdToCache(dtdTxt.url, dtdTxt.data)
      console.info(`DTD added to cache: ${dtdTxt.url}`)
      break
    }
  }

  return dtdTxt
}
