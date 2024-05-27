import { getCurrent } from '@tauri-apps/api/webviewWindow'
import type { Unlistener } from '$lib/types'
import { BROWSER } from '$lib/app/api'

export async function dragDropFileListener(): Promise<Unlistener> {
  if (BROWSER === 'Tauri') {
    const retFun = getCurrent().onDragDropEvent((event) => {
      if (event.payload.type === 'dragged') {
        console.info('Hovering:', event.payload.paths)
      } else if (event.payload.type === 'dragOver') {
        // console.info('Hovering at:', event.payload.position)
      } else if (event.payload.type === 'dropped') {
        const paths = event.payload.paths
        console.info('Dropped:', paths)
      } else {
        console.info('Drop Cancelled.')
      }
    })
    return retFun
  } else {
    return () => {}
  }
}
