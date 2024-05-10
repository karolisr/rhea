import { locale } from '@tauri-apps/plugin-os'
import { download as _download } from './download'
import { downloadText as _downloadText } from './download'
import { setScale as _setScale } from './scale'

export const download = _download
export const downloadText = _downloadText
export const setScale = _setScale

export async function getLocale(): Promise<string> {
  const l = await locale()
  if (l) {
    return l
  } else {
    return 'en-US'
  }
}
