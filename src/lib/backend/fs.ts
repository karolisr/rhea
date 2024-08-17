import { BaseDirectory, mkdir } from '@tauri-apps/plugin-fs'

export async function testDirs() {
  await mkdir('_AppData', { baseDir: BaseDirectory.AppData, recursive: true })
  await mkdir('_AppLocalData', {
    baseDir: BaseDirectory.AppLocalData,
    recursive: true
  })
  await mkdir('_AppConfig', {
    baseDir: BaseDirectory.AppConfig,
    recursive: true
  })
}
