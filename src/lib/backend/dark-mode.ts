import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Unlistener } from '$lib/types'
import { gSysInfo } from '$lib/backend/system-info'

export enum ThemeDarkLight {
  light = 'light',
  dark = 'dark'
}

export async function getOsTheme(): Promise<ThemeDarkLight> {
  let _theme = 'light'
  if (gSysInfo.browser === 'Tauri') {
    _theme = (await getCurrentWindow().theme()) || 'light'
  }
  if (_theme === ThemeDarkLight.dark) {
    return ThemeDarkLight.dark
  } else {
    return ThemeDarkLight.light
  }
}

export async function setAppTheme(): Promise<void> {
  const _tdl = await getOsTheme()
  let userSetting: string = 'os'
  await import('$lib/stores/settings').then((_) => {
    _.appSettings.subscribe((stng) => {
      userSetting = stng.theme
    })()
  })
  if (userSetting === 'os') {
    document.documentElement.setAttribute('app-theme', _tdl)
  } else {
    document.documentElement.setAttribute('app-theme', userSetting)
  }
}

export async function themeChangeListener(
  listener: (() => void) | undefined = undefined
): Promise<Unlistener> {
  if (gSysInfo.browser === 'Tauri') {
    const unlisten_fn = await listen<string>(
      TauriEvent.WINDOW_THEME_CHANGED,
      (_) => {
        setAppTheme()
        if (listener !== undefined) {
          listener()
        }
      }
    )
    setAppTheme()
    return unlisten_fn
  } else {
    return () => {}
  }
}
