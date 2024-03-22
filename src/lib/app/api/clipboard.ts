import { writeText, readText } from '@tauri-apps/api/clipboard'

export const cbr = async () => {
  return await readText()
}
export const cbw = async (txt: string) => {
  return await writeText(txt)
}
