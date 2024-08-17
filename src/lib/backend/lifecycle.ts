import { listen, TauriEvent } from '@tauri-apps/api/event'
import type { Unlistener } from '$lib/types'
import { gSysInfo } from '$lib/backend/system-info'

export async function beforeWindowClose(
  handler: () => void
): Promise<Unlistener> {
  if (gSysInfo.browser === 'Tauri') {
    const unlisten_fn = await listen<string>(
      TauriEvent.WINDOW_CLOSE_REQUESTED,
      (_) => handler()
    )
    return unlisten_fn
  } else {
    return () => {}
  }
}
