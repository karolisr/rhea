import { AppScale, AppFontSize } from '$lib/utils'
import { appSettings } from '$lib/stores/settings'

export function getAppScale(): keyof typeof AppScale {
  let scale: keyof typeof AppScale = 'small'
  appSettings.subscribe((stng) => {
    scale = stng.scale
  })()
  return scale
}

export function getFontSize(): number {
  const scale: keyof typeof AppScale = getAppScale()
  const fontSize: number = AppFontSize[scale]
  return fontSize
}

export function setAppScale(scale?: keyof typeof AppScale) {
  let userSetting: keyof typeof AppScale
  if (scale) {
    userSetting = scale
  } else {
    userSetting = getAppScale()
  }
  document.documentElement.setAttribute('scale', userSetting)
  appSettings.subscribe((stng) => {
    if (!scale) scale = stng.scale
    document.documentElement.setAttribute('scale', scale)
  })()
}
