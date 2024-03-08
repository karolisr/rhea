import { writable, type Writable } from 'svelte/store'
import { fetch, ResponseType } from '@tauri-apps/api/http'

export interface _cache_dtd {
  [url: string]: string
}

const key = 'cache-dtd'

function init(): Writable<_cache_dtd> {
  const _ = localStorage.getItem(key)
  let _dtds: _cache_dtd = {}
  if (_) {
    _dtds = JSON.parse(_)
  }
  const { subscribe, set, update } = writable(_dtds)
  return { subscribe, set, update }
}

const store = init()
export default store

// --------------------------------------------------------------------------

function dtd_url(url: string, ref_url?: string) {
  const base_url = ref_url ? ref_url : 'https://www.ncbi.nlm.nih.gov/dtd/'
  return new URL(url, base_url)
}

export function cache_get_dtd_txt(
  url: string,
  ref_url?: string
): string | null {
  url = dtd_url(url, ref_url).toString()
  let dtd_txt: string | null = null
  const unsubscribe = store.subscribe((_dtds) => {
    if (url in _dtds) {
      // console.log(`DTD cache hit: ${url}`)
      dtd_txt = _dtds[url]
    } else {
      // console.log(`DTD cache miss: ${url}`)
    }
  })
  unsubscribe()
  return dtd_txt
}
2

function cache_add_dtd_txt(url: string, dtd_txt: string): void {
  store.update((_dtds) => {
    _dtds[url] = dtd_txt
    localStorage.setItem(key, JSON.stringify(_dtds))
    return _dtds
  })
}

export function download_dtd_txt(
  url: string,
  ref_url?: string
): Promise<{ url: string; dtd_txt: string }> {
  url = dtd_url(url, ref_url).toString()
  const dtd_txt_promise = fetch<ResponseType.Text>(url, {
    method: 'GET',
    responseType: ResponseType.Text
  }).then((res) => {
    if (res.ok) {
      return { url: url, dtd_txt: res.data.toString() }
    } else {
      // return null
      throw new Error(`fetch(): ${url} (${res.status})`)
    }
  })

  dtd_txt_promise.then((rslt) => {
    if (rslt) {
      const { url, dtd_txt } = rslt
      cache_add_dtd_txt(url, dtd_txt)
      // console.log('DTD added to cache:', url)
    }
  })

  return dtd_txt_promise
}
