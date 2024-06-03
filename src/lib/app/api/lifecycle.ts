import { listen, TauriEvent } from '@tauri-apps/api/event'
import type { Unlistener } from '$lib/types'
import { BROWSER } from '$lib/app/api'

export async function beforeWindowClose(handler: () => void): Promise<Unlistener> {
  if (BROWSER === 'Tauri') {
    const unlisten_fn = await listen<string>(TauriEvent.WINDOW_CLOSE_REQUESTED, (_) => handler())
    return unlisten_fn
  } else {
    return () => {}
  }
}
