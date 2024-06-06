import settings from '$lib/app/svelte-stores/settings'

export enum AppScale {
  small = 'small',
  medium = 'medium',
  large = 'large'
}

export enum AppFontSize {
  small = 12,
  medium = 16,
  large = 24
}

export function setScale(scale: keyof typeof AppScale) {
  let userSetting: string = scale
  settings.subscribe((stng) => {
    userSetting = stng.scale
  })()
  window.document.documentElement.setAttribute('scale', userSetting)
}

export function getScale(): keyof typeof AppScale {
  let scale: keyof typeof AppScale = 'small'
  settings.subscribe((stng) => {
    scale = stng.scale
  })()
  return scale
}

export function getFontSize(): number {
  const scale: keyof typeof AppScale = getScale()
  const fontSize: number = AppFontSize[scale]
  return fontSize
}
