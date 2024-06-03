import { Detector } from 'detector-js'

import { locale } from '@tauri-apps/plugin-os'

import { download as _download } from './download'
import { downloadText as _downloadText } from './download'
import { setScale as _setScale } from './scale'
import { beforeWindowClose as _beforeWindowClose } from './lifecycle'

export const download = _download
export const downloadText = _downloadText
export const setScale = _setScale
export const beforeWindowClose = _beforeWindowClose

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

export function replacer(_: string, value: unknown): unknown {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from([...value])
    }
  } else if (value instanceof Set) {
    return {
      dataType: 'Set',
      value: Array.from([...value])
    }
  } else {
    return value
  }
}

export function reviver(_: string, obj: { dataType: string; value: Array<[unknown, unknown]> }): unknown {
  if (obj['dataType'] === 'Map') {
    return new Map(obj['value'])
  } else if (obj['dataType'] === 'Set') {
    return new Set(obj['value'])
  } else {
    return obj
  }
}
