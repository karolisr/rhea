import { listen, TauriEvent } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/api/window'

enum themeDarkLight {
  light = 'light',
  dark = 'dark'
}

type ThemeDarkLight = keyof typeof themeDarkLight

async function getCurentTheme(): Promise<ThemeDarkLight> {
  return await getCurrent()
    .theme()
    .then((_theme) => {
      if (_theme === themeDarkLight.dark) {
        return themeDarkLight.dark
      } else {
        return themeDarkLight.light
      }
    })
}

async function setTheme(): Promise<void> {
  const _tdl = await getCurentTheme()
  localStorage.setItem('color-theme', _tdl)
  if (_tdl === themeDarkLight.dark) {
    window.document.documentElement.classList.add(themeDarkLight.dark)
  } else {
    window.document.documentElement.classList.remove(themeDarkLight.dark)
  }
}

export async function themeChangeListener(): Promise<() => void> {
  return listen<string>(TauriEvent.WINDOW_THEME_CHANGED, (_) => {
    setTheme()
  }).then((unlistenFn) => {
    setTheme()
    return unlistenFn
  })
}
