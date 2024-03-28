import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/api/window'
import settings from '$lib/app/svelte-stores/settings'

enum themeDarkLight {
  light = 'light',
  dark = 'dark'
}

async function getCurentTheme() {
  const _theme = (await getCurrent().theme()) || 'light'
  if (_theme === themeDarkLight.dark) {
    return themeDarkLight.dark
  } else {
    return themeDarkLight.light
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
