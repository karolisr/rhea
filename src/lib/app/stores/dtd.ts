import { writable, type Writable } from 'svelte/store'

export interface _cache_dtd {
  url: string
  element_name: string
  dtd_txt: string
}

const key = 'cache-dtd'

function init(): Writable<_cache_dtd[]> {
  const _ = localStorage.getItem(key)
  let _dtds: _cache_dtd[] = []
  if (_) {
    _dtds = JSON.parse(_)
  }
  const { subscribe, set, update } = writable(_dtds)
  return { subscribe, set, update }
}

const dtds = init()
export default dtds

export function addDTD(
  url: string,
  element_name: string,
  dtd_txt: string
): void {
  const unsubscribe = dtds.subscribe((_dtds) => {
    localStorage.setItem(key, JSON.stringify(_dtds))
    _dtds = _dtds
  })
  unsubscribe()
}
