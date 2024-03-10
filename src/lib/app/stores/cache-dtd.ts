import { writable, derived, type Writable } from 'svelte/store'
import { dnld_txt } from '../api/download'

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
  const { subscribe, set, update } = writable(_dtds)
  return { subscribe, set, update }
}

export const dtds = init()
export const dtd_urls = derived(dtds, ($dtds) =>
  $dtds ? Object.getOwnPropertyNames($dtds).sort() : []
)

// --------------------------------------------------------------------------

function dtd_url(url: string, ref_url?: string) {
  const base_url = ref_url ? ref_url : 'https://www.ncbi.nlm.nih.gov/dtd/'
  return new URL(url, base_url)
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
  url = dtd_url(url, ref_url).toString()
  let dtd_txt: _DTD_TXT | null = null
  const unsubscribe = dtds.subscribe((_dtds) => {
    if (url in _dtds) {
      console.log(`DTD cache hit: ${url}`)
      dtd_txt = { url: url, data: _dtds[url] }
    } else {
      // console.log(`DTD cache miss: ${url}`)
    }
  })
  unsubscribe()
  return dtd_txt
}

export function dnld_dtd_txt(url: string, ref_url?: string): Promise<_DTD_TXT> {
  url = dtd_url(url, ref_url).toString()
  const dtd_txt_promise = dnld_txt(url)
  dtd_txt_promise.then((rslt) => {
    cache_add_dtd_txt(rslt.url, rslt.data)
    console.log(`DTD added to cache: ${rslt.url}`)
  })
  return dtd_txt_promise
}
