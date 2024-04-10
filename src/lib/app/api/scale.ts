import settings from '$lib/app/svelte-stores/settings'

export enum AppScale {
  small = 'small',
  medium = 'medium',
  large = 'large'
}

export async function setScale(scale: keyof typeof AppScale) {
  let userSetting: string = scale
  settings.subscribe((stng) => {
    userSetting = stng.scale
  })()
  window.document.documentElement.setAttribute('scale', userSetting)
}
