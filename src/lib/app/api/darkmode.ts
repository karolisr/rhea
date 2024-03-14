import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/api/window'

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

async function setTheme() {
  const _tdl = await getCurentTheme()
  localStorage.setItem('color-theme', _tdl)
  if (_tdl === themeDarkLight.dark) {
    window.document.documentElement.classList.add(themeDarkLight.dark)
  } else {
    window.document.documentElement.classList.remove(themeDarkLight.dark)
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
