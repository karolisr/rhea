import { AppScale, AppFontSize } from '.'

// ToDo: fixme
export function setAppScale(scale?: keyof typeof AppScale) {
  // let userSetting: keyof typeof AppScale = getAppScale()
  // if (scale) userSetting = scale
  // document.documentElement.setAttribute('scale', userSetting)
  // --------------------------------------------------------------------------
  import('$lib/stores/settings').then((_) => {
    _.appSettings.subscribe((stng) => {
      if (!scale) scale = stng.scale
      document.documentElement.setAttribute('scale', scale)
    })()
  })
}

// ToDo: fixme
export function getAppScale(): keyof typeof AppScale {
  // let scale: keyof typeof AppScale = 'medium'
  // import('$lib/stores/settings').then((_) => {
  //   _.appSettings.subscribe((stng) => {
  //     scale = stng.scale
  //   })()
  // })
  // return scale
  // --------------------------------------------------------------------------
  return 'small'
}

export function getFontSize(): number {
  const scale: keyof typeof AppScale = getAppScale()
  const fontSize: number = AppFontSize[scale]
  return fontSize
}
