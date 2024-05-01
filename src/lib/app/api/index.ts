import { locale } from '@tauri-apps/plugin-os'
import { dnld as _dnld } from './download'
import { dnld_txt as _dnld_txt } from './download'

export const dnld = _dnld
export const dnld_txt = _dnld_txt

export async function getLocale(): Promise<string> {
  const l = await locale()
  if (l) {
    return l
  } else {
    return 'en-US'
  }
}
