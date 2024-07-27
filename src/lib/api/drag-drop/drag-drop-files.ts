import { getCurrentWindow } from '@tauri-apps/api/window'
import type { Unlistener } from '$lib/types'
import { BROWSER } from '$lib/api'
import { DragDropBasic } from './drag-drop-basic'

export class DragDropFiles extends DragDropBasic {
  private _unlistener: Promise<Unlistener>
  private _ts: HTMLElement[] = []
  private _t: HTMLElement | null = null

  constructor() {
    super()
    if (BROWSER === 'Tauri') {
      this._unlistener = this._listen()
    } else {
      this._unlistener = new Promise(() => {})
    }
  }

  public async unlisten() {
    super.unlisten()
    const _unlistener = await this._unlistener
    _unlistener()
  }

  private dragStart(paths: string[]) {
    const plrl: string = paths.length !== 1 ? 'files' : 'file'
    this.drgSourceEl = {
      id: `${paths.length} ${plrl}`
    } as unknown as HTMLElement
    this.beforeDrag = -1
    this.dragging = true

    document.documentElement.setAttribute('dragging', 'true')

    this.payload = {
      type: 'files',
      data: paths,
      targetCanAccept: false,
      showWhileDraggingEl: null
    }
  }

  private inBounds(a: number, b: number, c: number, mar: number = 0): boolean {
    if (a + mar < c && b - mar > c) return true
    return false
  }

  private overlaps(
    l: number,
    t: number,
    w: number,
    h: number,
    x: number,
    y: number,
    mar: number = 0
  ): boolean {
    return this.inBounds(l, l + w, x, mar) && this.inBounds(t, t + h, y, mar)
  }

  private async _listen(): Promise<Unlistener> {
    const retFun = await getCurrentWindow().onDragDropEvent(async (event) => {
      if (event.payload.type === 'enter') {
        // console.info('DragDropFiles:', event.payload.paths)
        await getCurrentWindow().setFocus()
        this.drgTargetEl = null
        this._t = null
        this._ts = []
        this.dragStart(event.payload.paths)
        const _ts = document.getElementsByClassName('drag-target')
        for (let i = 0; i < _ts.length; i++) {
          this._ts.push(_ts[i] as HTMLElement)
        }
      } else if (event.payload.type === 'over') {
        this._t = null
        for (let i = 0; i < this._ts.length; i++) {
          const _t = this._ts[i] as HTMLElement
          if (
            _t &&
            this.overlaps(
              _t.offsetLeft,
              _t.offsetTop,
              _t.offsetWidth,
              _t.offsetHeight,
              event.payload.position.x,
              event.payload.position.y
            )
          ) {
            this._t = _t
            break
          }
        }
        // if (
        //   !this.overlaps(
        //     document.body.offsetLeft,
        //     document.body.offsetTop,
        //     document.body.offsetWidth,
        //     document.body.offsetHeight,
        //     event.payload.position.x,
        //     event.payload.position.y,
        //     20
        //   )
        // ) {
        //   this._t = null
        //   this.drgTargetEl = null
        //   const _e = { target: this.drgTargetEl } as unknown as Event
        //   this.mouseOverLstnr(_e)
        //   this.dragStopLstnr()
        //   this.drgTargetEl = null
        // }
        if (this._t !== null) {
          // console.log('over')
          // if (this.drgTargetEl?.id !== this._t.id) {
          this.drgTargetEl = this._t
          this.drgTargetEl.style.zIndex = '30'
          const _e = { target: this.drgTargetEl } as unknown as Event
          this.mouseOverLstnr(_e)
          // }
        } else {
          if (this.drgTargetEl !== null) {
            if (this.drgTargetEl) this.drgTargetEl.style.zIndex = '0'
            this.drgTargetEl = null
            this._t = null
            const _e = { target: this.drgTargetEl } as unknown as Event
            this.mouseOverLstnr(_e)
          }
        }
      } else {
        // console.info('DragDropFiles: drop/cancel')
        if (this.drgTargetEl) this.drgTargetEl.style.zIndex = '0'
        const _e = { target: this.drgTargetEl } as unknown as Event
        this.mouseOverLstnr(_e)
        this.dragStopLstnr()
        this.drgTargetEl = null
      }
      //   else if (event.payload.type === 'drop') {
      //   console.info('DragDropFiles: drop')
      //   if (this.drgTargetEl) this.drgTargetEl.style.zIndex = '0'
      //   const _e = { target: this.drgTargetEl } as unknown as Event
      //   this.mouseOverLstnr(_e)
      //   this.dragStopLstnr()
      //   this.drgTargetEl = null
      // } else {
      //   console.info('DragDropFiles: cancel')
      //   if (this.drgTargetEl) this.drgTargetEl.style.zIndex = '0'
      //   this.drgTargetEl = null
      //   const _e = { target: this.drgTargetEl } as unknown as Event
      //   this.mouseOverLstnr(_e)
      //   this.dragStopLstnr()
      // }
    })
    return retFun
  }
}
