import { Detector } from 'detector-js'

import { locale } from '@tauri-apps/plugin-os'

import { download as _download } from './download'
import { downloadText as _downloadText } from './download'
import { setScale as _setScale } from './scale'
import { getScale as _getScale } from './scale'
import { getFontSize as _getFontSize } from './scale'
import { beforeWindowClose as _beforeWindowClose } from './lifecycle'

export const download = _download
export const downloadText = _downloadText
export const setScale = _setScale
export const getScale = _getScale
export const getFontSize = _getFontSize
export const beforeWindowClose = _beforeWindowClose

export const SYSINFO = getSystemInfo()
export const BROWSER = SYSINFO.browser
export const ENGINE = SYSINFO.engine
export const PIXELRATIO = SYSINFO.pixelRatio

export async function getLocale(): Promise<string> {
  let l: string | null = null
  if (getSystemInfo().browser === 'Tauri') {
    l = await locale()
    if (l === null) {
      l = navigator.language
    }
  } else {
    l = navigator.language
  }

  console.info(`Locale: ${l}`)

  if (l === null || l === '' || l === 'C') {
    l = 'en-US'
    console.info(`using locale: ${l}`)
  }

  return l
}

interface SystemInfo {
  browser: string
  engine: string
  pixelRatio: number
}

function getSystemInfo(): SystemInfo {
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
    pixelRatio
  }
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

export function reviver(
  _: string,
  obj: {
    dataType: string
    value: Array<[unknown, unknown]>
  }
): unknown {
  if (obj['dataType'] === 'Map') {
    return new Map(obj['value'])
  } else if (obj['dataType'] === 'Set') {
    return new Set(obj['value'])
  } else {
    return obj
  }
}