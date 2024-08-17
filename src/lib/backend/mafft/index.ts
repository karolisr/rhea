import { Command } from '@tauri-apps/plugin-shell'

export async function mafft(args: string[]) {
  const command = Command.create('mafft', args)
  const output = await command.execute()
  return output
}
