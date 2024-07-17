import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import settings from '$lib/svelte-stores/settings'
import type { Unlistener } from '$lib/types'
import { BROWSER } from '$lib/api'

export enum ThemeDarkLight {
  light = 'light',
  dark = 'dark'
}

export async function getCurentTheme(): Promise<ThemeDarkLight> {
  let _theme = 'light'
  if (BROWSER === 'Tauri') {
    _theme = (await getCurrentWindow().theme()) || 'light'
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

export async function themeChangeListener(
  listener: (() => void) | undefined = undefined
): Promise<Unlistener> {
  if (BROWSER === 'Tauri') {
    const unlisten_fn = await listen<string>(
      TauriEvent.WINDOW_THEME_CHANGED,
      (_) => {
        setTheme()
        if (listener !== undefined) {
          listener()
        }
      }
    )
    setTheme()
    return unlisten_fn
  } else {
    return () => {}
  }
}
