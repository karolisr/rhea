import { writable, type Writable } from 'svelte/store'
import { getLocale } from '$lib/app/api'
import { setTheme } from '$lib/app/api/darkmode'
import { AppScale } from '../api/scale'

export interface Settings {
  email: string
  ncbi_api_key: string
  locale: string
  theme: string
  scale: keyof typeof AppScale
}

const key = 'settings'

function init(): Writable<Settings> {
  const stng_stored = localStorage.getItem(key)
  let stng: Settings = {
    email: '',
    ncbi_api_key: '',
    locale: '',
    theme: 'os',
    scale: 'small'
  }
  if (stng_stored) {
    stng = JSON.parse(stng_stored)
  }
  getLocale().then((locale) => {
    stng.locale = locale
  })
  return writable(stng)
}

const settings = init()
export default settings

export function saveSettings(): void {
  settings.update((stng) => {
    localStorage.setItem(key, JSON.stringify(stng))
    setTheme()
    return stng
  })
}
