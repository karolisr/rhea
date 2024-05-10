import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager'

export const clipboardRead = async () => {
  return await readText()
}
export const clipboardWrite = async (txt: string) => {
  return await writeText(txt)
}
