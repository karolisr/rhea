import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/api/window'
import settings from '$lib/app/svelte-stores/settings'
import type { Unlistener } from '$lib/types'
import { BROWSER } from '$lib/app/api'

export enum ThemeDarkLight {
  light = 'light',
  dark = 'dark'
}

export async function getCurentTheme(): Promise<ThemeDarkLight> {
  let _theme = 'light'
  if (BROWSER === 'Tauri') {
    _theme = (await getCurrent().theme()) || 'light'
  }
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
  if (BROWSER === 'Tauri') {
    const unlisten_fn = await listen<string>(
      TauriEvent.WINDOW_THEME_CHANGED,
      (_) => setTheme()
    )
    setTheme()
    return unlisten_fn
  } else {
    return () => {}
  }
}
