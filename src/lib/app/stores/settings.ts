import { writable, type Writable } from 'svelte/store'
import { getLocale } from '$lib/app/api'

export interface Settings {
  email: string
  ncbi_api_key: string
  locale: string
}

const key = 'settings'

function init(): Writable<Settings> {
  const _ = localStorage.getItem(key)
  let stng: Settings = {
    email: '',
    ncbi_api_key: '',
    locale: ''
  }
  if (_) {
    stng = JSON.parse(_)
  }
  getLocale().then((locale) => {
    stng.locale = locale
  })
  const { subscribe, set, update } = writable(stng)
  return { subscribe, set, update }
}

const settings = init()
export default settings

export function saveSettings(): void {
  const unsubscribe = settings.subscribe((stng) => {
    localStorage.setItem(key, JSON.stringify(stng))
    stng = stng
  })
  unsubscribe()
}
