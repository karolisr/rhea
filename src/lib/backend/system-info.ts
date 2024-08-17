import { locale } from '@tauri-apps/plugin-os'
import { Detector } from 'detector-js'

export const gSysInfo = getSystemInfo()

export interface SystemInfo {
  browser: string
  engine: string
  pixelRatio: number
  locale: string
}

export async function getLocale(): Promise<string> {
  let l: string | null = null
  if (gSysInfo.browser === 'Tauri') {
    l = await locale()
    if (l === null) {
      l = navigator.language
    }
  } else {
    l = navigator.language
  }
  if (l === null || l === '' || l === 'C') {
    l = 'en-US'
  }
  gSysInfo.locale = l
  return l
}

export function getSystemInfo(): SystemInfo {
  const detector = new Detector()
  let engine: string = '?'
  let browser: string = '?'
  let pixelRatio: number = 1

  if ('pixelRatio' in detector.feature) {
    pixelRatio = detector.feature.pixelRatio as number
  }

  if ('name' in detector.engine) {
    engine = detector.engine.name as string
  }

  if ('__TAURI_INTERNALS__' in window) {
    browser = 'Tauri'
  } else {
    if ('name' in detector.browser) {
      browser = detector.browser.name as string
    }
  }

  return {
    browser,
    engine,
    pixelRatio,
    locale: 'en-US'
  }
}
