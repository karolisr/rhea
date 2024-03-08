import { locale } from '@tauri-apps/api/os'

export async function getLocale(): Promise<string> {
  const l = await locale()
  if (l) {
    return l
  } else {
    return 'en-US'
  }
}
