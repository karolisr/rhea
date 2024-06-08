import { writable, derived, type Writable } from 'svelte/store'
import { downloadText } from '$lib/app/api/download'

interface _CACHE_DTD {
  [url: string]: string
}

const key = 'cache-dtd'

function init(): Writable<_CACHE_DTD> {
  const _ = localStorage.getItem(key)
  let _dtds: _CACHE_DTD = {}
  if (_) {
    _dtds = JSON.parse(_)
  }
  return writable(_dtds)
}

export const dtds = init()
export const dtd_urls = derived(dtds, ($dtds) =>
  $dtds ? Object.getOwnPropertyNames($dtds).sort() : []
)

// --------------------------------------------------------------------------

function getDtdUrls(url: string, ref_url?: string): URL[] {
  const base_urls = [
    'https://www.ncbi.nlm.nih.gov/dtd/',
    'https://www.ncbi.nlm.nih.gov/entrez/query/DTD/',
    'https://www.ncbi.nlm.nih.gov/data_specs/dtd/other/entrez/',
    'https://www.ncbi.nlm.nih.gov/data_specs/dtd/',
    'https://www.nlm.nih.gov/databases/dtd/'
  ]
  const rv: URL[] = []

  url = url.replace('http:', 'https:')

  if (ref_url) {
    rv.push(new URL(url, ref_url))
  }

  base_urls.forEach((bu) => {
    rv.push(new URL(url, bu))
  })

  return rv
}

export interface _DTD_TXT {
  url: string
  data: string
}

function cache_add_dtd_txt(url: string, txt: string): void {
  dtds.update((_dtds) => {
    _dtds[url] = txt
    localStorage.setItem(key, JSON.stringify(_dtds))
    return _dtds
  })
}

export function cache_get_dtd_txt(
  url: string,
  ref_url?: string
): _DTD_TXT | null {
  const urls = getDtdUrls(url, ref_url)
  let dtd_txt: _DTD_TXT | null = null

  for (const _url of urls) {
    const url = _url.toString()
    const unsubscribe = dtds.subscribe((_dtds) => {
      if (url in _dtds) {
        // console.info(`DTD cache hit: ${url}`)
        dtd_txt = {
          url: url,
          data: _dtds[url]
        }
      } else {
        // console.info(`DTD cache miss: ${url}`)
        dtd_txt = null
      }
    })
    unsubscribe()
    if (dtd_txt) break
  }

  return dtd_txt
}

export async function dnld_dtd_txt(
  url: string,
  ref_url?: string
): Promise<_DTD_TXT | null> {
  const urls = getDtdUrls(url, ref_url)
  let dtd_txt: {
    url: string
    data: string
  } | null = {
    url,
    data: ''
  }

  for (const _url of urls) {
    const url = _url.toString()
    dtd_txt = await downloadText(url)
    if (dtd_txt) {
      cache_add_dtd_txt(dtd_txt.url, dtd_txt.data)
      console.info(`DTD added to cache: ${dtd_txt.url}`)
      break
    }
  }

  return dtd_txt
}
