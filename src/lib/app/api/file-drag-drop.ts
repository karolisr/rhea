import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Unlistener } from '$lib/types'
import { BROWSER } from '$lib/app/api'

export class FileDragDrop {
  unlisten: Promise<Unlistener>
  onDragStart: ((paths: string[]) => void) | undefined
  onDrag: ((x: number, y: number) => void) | undefined
  onDrop: ((paths: string[], x: number, y: number) => void) | undefined
  onDragCancel: (() => void) | undefined

  constructor(
    onDrop?: (paths: string[], x: number, y: number) => void,
    onDragCancel?: () => void,
    onDragStart?: (paths: string[]) => void,
    onDrag?: (x: number, y: number) => void
  ) {
    this.onDragStart = onDragStart
    this.onDrag = onDrag
    this.onDrop = onDrop
    this.onDragCancel = onDragCancel
    this.unlisten = this.#listen()
  }

  async #listen(): Promise<Unlistener> {
    if (BROWSER === 'Tauri') {
      const retFun = getCurrentWindow().onDragDropEvent(async (event) => {
        if (event.payload.type === 'enter') {
          // console.info('FileDragDrop.onDragStart:', event.payload.paths)
          if (this.onDragStart !== undefined)
            this.onDragStart(event.payload.paths)
        } else if (event.payload.type === 'over') {
          // console.info(
          //   'FileDragDrop.onDrag:',
          //   event.payload.position.x,
          //   event.payload.position.y
          // )
          if (this.onDrag !== undefined)
            this.onDrag(event.payload.position.x, event.payload.position.y)
        } else if (event.payload.type === 'drop') {
          // console.info(
          //   'FileDragDrop.onDrop:',
          //   event.payload.paths,
          //   event.payload.position.x,
          //   event.payload.position.y
          // )
          if (this.onDrop !== undefined)
            this.onDrop(
              event.payload.paths,
              event.payload.position.x,
              event.payload.position.y
            )
        } else {
          // console.info('FileDragDrop.onDragCancel')
          if (this.onDragCancel !== undefined) this.onDragCancel()
        }
      })
      return retFun
    } else {
      return () => {}
    }
  }
}
