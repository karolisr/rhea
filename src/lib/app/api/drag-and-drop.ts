import { getCurrent } from '@tauri-apps/api/webviewWindow'
import type { Unlistener } from '$lib/types'
import { BROWSER } from '$lib/app/api'

export async function dragDropFileListener(): Promise<Unlistener> {
  if (BROWSER === 'Tauri') {
    const retFun = getCurrent().onDragDropEvent((event) => {
      if (event.payload.type === 'dragged') {
        console.info('File(s) dragging:', event.payload.paths)
      } else if (event.payload.type === 'dragOver') {
        console.info('File(s) hovering at:', event.payload.position)
      } else if (event.payload.type === 'dropped') {
        const paths = event.payload.paths
        console.info('File(s) dropped:', paths)
      } else {
        console.info('File(s) drop was cancelled.')
      }
    })
    return retFun
  } else {
    return () => {}
  }
}
