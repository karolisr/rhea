// import { getCurrentWindow } from '@tauri-apps/api/window'

import type {
  DragStartEvent,
  DragOverEvent,
  DropEvent,
  DragDropPayload
} from '../types'

const min = Math.min
const max = Math.max

export class DragDropBasic {
  protected drgEl1: HTMLElement | null = null
  protected drgEl2: HTMLElement | null = null

  protected beforeDrag: number = -1
  protected dragging: boolean = false
  protected draggingEnded: boolean = false

  protected drgSourceEl: HTMLElement | null = null
  protected drgTargetEl: HTMLElement | null = null
  protected drgTargetElPrev: HTMLElement | null = null

  protected defaultPayload: DragDropPayload = {
    type: 'type.default',
    data: 'data.default',
    targetCanAccept: false,
    showWhileDraggingEl: null
  }
  protected payload: DragDropPayload = this.defaultPayload

  constructor() {
    addEventListener('mousemove', this.mMoveL)
    addEventListener('mouseover', this.mOverL)
    addEventListener('mouseup', this.dStopL)
    addEventListener('drop', this.mOverL)
    document.documentElement.setAttribute('dragging', 'false')
    console.info('DragDrop: listen')
  }

  public async unlisten() {
    removeEventListener('mousemove', this.mMoveL)
    removeEventListener('mouseover', this.mOverL)
    removeEventListener('mouseup', this.dStopL)
    removeEventListener('drop', this.mOverL)
    console.info('DragDrop: unlisten')
  }

  protected dStrtL: (e: MouseEvent) => void = this.dragStartLstnr.bind(this)
  protected mMoveL: (e: MouseEvent) => void = this.mouseMoveLstnr.bind(this)
  protected mOverL: (e: MouseEvent) => void = this.mouseOverLstnr.bind(this)
  protected dStopL: (e?: MouseEvent) => void = this.dragStopLstnr.bind(this)

  protected prepDrgEl(el: HTMLElement | null) {
    if (el) {
      this.clearDrgEl(el)
      el.addEventListener('mousedown', this.dStrtL)
    }
  }

  protected clearDrgEl(el: HTMLElement | null) {
    if (el) {
      el.removeEventListener('mousedown', this.dStrtL)
    }
  }

  protected mouseOverLstnr(e: Event) {
    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains('draggable')
    ) {
      this.draggingEnded = false
      if (!this.dragging) {
        this.drgEl1 = e.target
        this.prepDrgEl(this.drgEl1)
      } else {
        this.drgEl2 = e.target
      }
    } else {
      if (this.draggingEnded) {
        this.draggingEnded = false
        return
      }
      this.drgEl1 = null
      this.drgEl2 = null
    }

    this.drgTargetElPrev?.classList.remove('drag-item-hovering')
    this.drgTargetEl?.classList.remove('drag-item-hovering')

    if (
      this.dragging &&
      (e.target instanceof HTMLElement || e.target === null)
    ) {
      this.drgTargetElPrev = this.drgTargetEl
      this.drgTargetEl = e.target
      if (
        this.drgTargetEl &&
        this.drgTargetEl.classList.contains('drag-target')
      ) {
        const dragOverEv = new Event('dragenter') as DragOverEvent
        dragOverEv.payload = this.payload
        this.drgTargetEl.dispatchEvent(dragOverEv)

        if (this.payload.targetCanAccept) {
          this.drgTargetEl.classList.add('drag-item-hovering')
          document.body.style.cursor = 'copy'
          // getCurrentWindow().setCursorIcon('copy')
        } else {
          document.body.style.cursor = 'no-drop'
          // getCurrentWindow().setCursorIcon('noDrop')
        }
      } else if (this.drgTargetElPrev) {
        this.drgTargetElPrev.classList.remove('drag-item-hovering')
        this.payload.targetCanAccept = false

        document.body.style.cursor = 'default'
        // getCurrentWindow().setCursorIcon('default')
      }
    }
  }

  protected dragStartLstnr(e: Event) {
    if (e.target === this.drgEl1) {
      this.drgSourceEl = this.drgEl1
      this.beforeDrag = 0
      this.drgEl2 = this.drgEl1
    }
  }

  protected mouseMoveLstnr(e: MouseEvent) {
    const drgOffsetX = -1
    const drgOffsetY = -25
    if (this.beforeDrag >= 0) this.beforeDrag += 1
    if (this.beforeDrag > 1 && this.drgSourceEl) {
      document.body.style.cursor = 'default'
      // getCurrentWindow().setCursorIcon('default')
      this.beforeDrag = -1
      this.dragging = true
      document.documentElement.setAttribute('dragging', 'true')
      // console.info(`Dragging: ${this.drgSourceEl?.id}`)
      const dragStartEv = new Event('dragstart') as DragStartEvent

      const el = document.createElement('div')
      el.style.transition = 'opacity 250ms'
      el.style.opacity = '0'
      el.style.pointerEvents = 'none'
      el.style.paddingBlock = '5px'
      el.style.paddingInline = '5px'
      el.style.position = 'absolute'
      el.style.left = `${e.x + drgOffsetX}px`
      el.style.top = `${e.y + drgOffsetY}px`
      el.style.zIndex = '1000'
      const pEl = document.body
      pEl.appendChild(el)

      this.payload = {
        type: 'TYPE',
        data: this.drgSourceEl?.id,
        targetCanAccept: false,
        showWhileDraggingEl: el
      }

      dragStartEv.payload = this.payload
      this.drgSourceEl.dispatchEvent(dragStartEv)
    } else if (this.payload.showWhileDraggingEl !== null) {
      const el = this.payload.showWhileDraggingEl
      el.style.opacity = '1'
      el.style.left = `${max(0, min(e.x + drgOffsetX, window.innerWidth - el.offsetWidth))}px`
      el.style.top = `${max(28, min(e.y + drgOffsetY, window.innerHeight - el.offsetHeight))}px`
    }
  }

  protected dragStopLstnr(_?: Event) {
    this.beforeDrag = -1

    if (this.payload.showWhileDraggingEl !== null) {
      const el = this.payload.showWhileDraggingEl
      el.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(el)
      }, 250)
    }

    if (this.dragging) {
      document.body.style.cursor = 'default'
      // getCurrentWindow().setCursorIcon('default')

      let flag = true
      if (this.drgEl1 === this.drgEl2) flag = false
      this.drgEl1 = this.drgEl2
      this.prepDrgEl(this.drgEl1)
      this.drgEl2 = null
      this.dragging = false
      document.documentElement.setAttribute('dragging', 'false')

      if (this.drgEl1) {
        if (flag) this.draggingEnded = true
      }
      if (
        this.drgTargetEl &&
        this.drgTargetEl.id &&
        this.drgTargetEl.classList.contains('drag-target') &&
        this.drgSourceEl !== this.drgTargetEl &&
        this.payload.targetCanAccept
      ) {
        // console.info(`Dropped: ${this.drgSourceEl?.id}/${this.drgTargetEl?.id}`)

        const dropEv = new Event('drop') as DropEvent
        dropEv.payload = this.payload
        this.drgTargetEl.dispatchEvent(dropEv)

        if (this.drgTargetEl) {
          this.drgTargetEl.classList.remove('drag-item-hovering')
        }
        this.drgSourceEl = null
        this.drgTargetEl = null
        this.drgTargetElPrev = null
      } else {
        // console.info(`Dragging cancelled: ${this.drgSourceEl?.id}`)
        if (this.drgTargetEl) {
          this.drgTargetEl.classList.remove('drag-item-hovering')
        }
        this.drgSourceEl = null
        this.drgTargetEl = null
        this.drgTargetElPrev = null
      }
    } else {
      this.draggingEnded = true
    }
    this.payload = this.defaultPayload
  }
}
