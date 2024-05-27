import { Detector } from 'detector-js'

import { locale } from '@tauri-apps/plugin-os'

import { download as _download } from './download'
import { downloadText as _downloadText } from './download'
import { setScale as _setScale } from './scale'

export const download = _download
export const downloadText = _downloadText
export const setScale = _setScale

export const SYSINFO = getSystemInfo()
export const BROWSER = SYSINFO.browser
export const ENGINE = SYSINFO.engine

export async function getLocale(): Promise<string> {
  if (getSystemInfo().browser === 'Tauri') {
    const l = await locale()
    if (l) {
      return l
    } else {
      return navigator.language
    }
  } else {
    return navigator.language
  }
}

interface SystemInfo {
  browser: string
  engine: string
}

function getSystemInfo(): SystemInfo {
  const detector = new Detector()
  let engine: string = '?'
  let browser: string = '?'

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

  return { browser, engine }
}
