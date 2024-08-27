import { writable, type Writable } from 'svelte/store'
import { getLocale } from '$lib/backend/system-info'
import { setAppTheme } from '$lib/backend/dark-mode'
import { setAppScale } from '$lib/backend/scale'
import type { AppSettings } from '.'

const key = 'settings'

function init(): Writable<AppSettings> {
  const stng_stored = localStorage.getItem(key)
  let stng: AppSettings = {
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

export const appSettings = init()

export function applyAppSettings(): void {
  setAppTheme()
  setAppScale()
}

export function saveAppSettings(): void {
  appSettings.update((stng) => {
    localStorage.setItem(key, JSON.stringify(stng))
    applyAppSettings()
    return stng
  })
}
