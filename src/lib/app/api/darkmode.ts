import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/api/window'
import settings from '$lib/app/svelte-stores/settings'

export enum ThemeDarkLight {
  light = 'light',
  dark = 'dark'
}

export async function getCurentTheme() {
  const _theme = (await getCurrent().theme()) || 'light'
  if (_theme === ThemeDarkLight.dark) {
    return ThemeDarkLight.dark
  } else {
    return ThemeDarkLight.light
  }
}

export async function setTheme() {
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

export async function themeChangeListener() {
  const unlisten_fn = await listen<string>(
    TauriEvent.WINDOW_THEME_CHANGED,
    (_) => setTheme()
  )
  setTheme()
  return unlisten_fn
}
