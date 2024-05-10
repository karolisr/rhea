import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/api/webviewWindow'
import settings from '$lib/app/svelte-stores/settings'
import type { Unlistener } from '$lib/types'

export enum ThemeDarkLight {
  light = 'light',
  dark = 'dark'
}

export async function getCurentTheme(): Promise<ThemeDarkLight> {
  const _theme = (await getCurrent().theme()) || 'light'
  if (_theme === ThemeDarkLight.dark) {
    return ThemeDarkLight.dark
  } else {
    return ThemeDarkLight.light
  }
}

export async function setTheme(): Promise<void> {
  const _tdl = await getCurentTheme()
  let userSetting: string = 'os'
  settings.subscribe((stng) => {
    userSetting = stng.theme
  })()
  if (userSetting === 'os') {
    window.document.documentElement.setAttribute('app-theme', _tdl)
  } else {
    window.document.documentElement.setAttribute('app-theme', userSetting)
  }
}

export async function themeChangeListener(): Promise<Unlistener> {
  const unlisten_fn = await listen<string>(
    TauriEvent.WINDOW_THEME_CHANGED,
    (_) => setTheme()
  )
  setTheme()
  return unlisten_fn
}
