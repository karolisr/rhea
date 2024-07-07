import { Command } from '@tauri-apps/plugin-shell'

export async function mafft() {
  const command = Command.sidecar('sidecar/mafft', ['--help'])
  const output = await command.execute()
  return output
}
