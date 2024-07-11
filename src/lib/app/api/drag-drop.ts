import type {
  DragStartEvent,
  DragOverEvent,
  DropEvent,
  DragDropPayload
} from './types'
import { min, max } from '$lib'
import { FileDragDrop } from '$lib/app/api/file-drag-drop'
import type { Unlistener } from '$lib/types'

export class DragDrop {
  private drgEl1: HTMLElement | null = null
  private drgEl2: HTMLElement | null = null

  private beforeDrag: number = -1
  private dragging: boolean = false
  private draggingEnded: boolean = false

  private drgSourceEl: HTMLElement | null = null
  private drgTargetEl: HTMLElement | null = null
  private drgTargetElPrev: HTMLElement | null = null

  private defaultPayload: DragDropPayload = {
    type: 'type.default',
    data: 'data.default',
    targetCanAccept: false,
    showWhileDraggingEl: null
  }
  private payload: DragDropPayload = this.defaultPayload

  private fileDragDropUnlistener: Promise<Unlistener>

  constructor() {
    addEventListener('mousemove', this.#mMoveL)
    addEventListener('mouseover', this.#mOverL)
    addEventListener('mouseup', this.#dStopL)
    addEventListener('drop', this.#mOverL)

    this.fileDragDropUnlistener = new FileDragDrop(
      (paths, x, y) => {}, // onDrop

      // () => {}, // onDragCancel
      this.#dStopL,

      // (paths) => {},                 // onDragStart
      this.#onFilesDragStart.bind(this),

      () => {} // onDrag

      // ((x: number, y: number) => {
      //   const e = { x: x, y: y }
      //   this.#mouseMoveEventListener(e as MouseEvent, true)
      // }).bind(this)
    ).unlisten

    window.document.documentElement.setAttribute('dragging', 'false')

    console.info('DragDrop: listen')
  }

  async unlisten() {
    ;(await this.fileDragDropUnlistener)()
    removeEventListener('mousemove', this.#mMoveL)
    removeEventListener('mouseover', this.#mOverL)
    removeEventListener('mouseup', this.#dStopL)
    removeEventListener('drop', this.#mOverL)

    console.info('DragDrop: unlisten')
  }

  #dStrtL: (e: MouseEvent) => void = this.#dragStartListener.bind(this)
  #mMoveL: (e: MouseEvent) => void = this.#mouseMoveEventListener.bind(this)
  #mOverL: (e: MouseEvent) => void = this.#mouseOverEventListener.bind(this)
  #dStopL: (e?: MouseEvent) => void = this.#dragStopListener.bind(this)

  #onFilesDragStart(paths: string[]) {
    const el = document.createElement('div')
    el.id = 'files-drag-drop-el'
    // el.style.transition = 'opacity 250ms'
    // el.style.opacity = '0'
    // el.style.pointerEvents = 'none'
    // el.style.paddingBlock = '5px'
    // el.style.paddingInline = '5px'
    // el.style.position = 'absolute'
    // el.style.left = `${e.x + drgOffsetX}px`
    // el.style.top = `${e.y + drgOffsetY}px`
    // el.style.zIndex = '1000'
    // el.style.borderStyle = 'solid'
    // el.style.backgroundColor = 'yellow'
    // el.innerText = paths[0]
    el.classList.add('draggable')

    document.body.appendChild(el)

    this.drgEl1 = el
    this.drgSourceEl = el
    this.drgEl2 = el
    this.beforeDrag = -1
    this.dragging = true

    window.document.documentElement.setAttribute('dragging', 'true')

    this.payload = {
      type: 'some-type',
      data: paths[0],
      targetCanAccept: false,
      showWhileDraggingEl: null
    }
  }

  #prepDrgEl(el: HTMLElement | null) {
    if (el) {
      this.#clearDrgEl(el)
      el.addEventListener('mousedown', this.#dStrtL)
    }
  }

  #clearDrgEl(el: HTMLElement | null) {
    if (el) {
      el.removeEventListener('mousedown', this.#dStrtL)
    }
  }

  #mouseOverEventListener(e: MouseEvent) {
    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains('draggable')
    ) {
      this.draggingEnded = false
      if (!this.dragging) {
        this.drgEl1 = e.target
        this.#prepDrgEl(this.drgEl1)
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
        } else {
          document.body.style.cursor = 'no-drop'
        }
      } else if (this.drgTargetElPrev) {
        this.drgTargetElPrev.classList.remove('drag-item-hovering')
        this.payload.targetCanAccept = false
        document.body.style.cursor = 'default'
      }
    }
  }

  #dragStartListener(e: MouseEvent) {
    if (e.target === this.drgEl1) {
      this.drgSourceEl = this.drgEl1
      this.beforeDrag = 0
      this.drgEl2 = this.drgEl1
    }
  }

  #mouseMoveEventListener(e: MouseEvent) {
    const drgOffsetX = -1
    const drgOffsetY = -25
    if (this.beforeDrag >= 0) this.beforeDrag += 1
    if (this.beforeDrag > 1 && this.drgSourceEl) {
      document.body.style.cursor = 'default'
      this.beforeDrag = -1
      this.dragging = true
      window.document.documentElement.setAttribute('dragging', 'true')
      // console.log(`Dragging: ${this.drgSourceEl?.id}`)
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

  #dragStopListener(e?: MouseEvent) {
    this.beforeDrag = -1

    if (this.payload.showWhileDraggingEl !== null) {
      const el = this.payload.showWhileDraggingEl
      el.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(el)
      }, 250)
    }

    if (this.drgEl1) {
      document.body.style.cursor = 'default'
    } else {
      document.body.style.cursor = 'default'
    }

    if (this.dragging) {
      let flag = true
      if (this.drgEl1 === this.drgEl2) flag = false
      this.drgEl1 = this.drgEl2
      this.#prepDrgEl(this.drgEl1)
      this.drgEl2 = null
      this.dragging = false
      window.document.documentElement.setAttribute('dragging', 'false')

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
        // console.log(`Dropped: ${this.drgSourceEl?.id} / ${this.drgTargetEl?.id}`)

        const dropEv = new Event('drop') as DropEvent
        dropEv.payload = this.payload
        this.drgTargetEl.dispatchEvent(dropEv)

        if (this.drgTargetEl)
          this.drgTargetEl.classList.remove('drag-item-hovering')
        this.drgSourceEl = null
        this.drgTargetEl = null
      } else {
        // console.log(`Dragging cancelled: ${this.drgSourceEl?.id}`)
        if (this.drgTargetEl)
          this.drgTargetEl.classList.remove('drag-item-hovering')
        if (this.drgSourceEl) {
          this.drgSourceEl = null
          this.drgTargetEl = null
        }
      }
    } else {
      this.draggingEnded = true
    }
    this.payload = this.defaultPayload

    let tmpEl = window.document.getElementById('files-drag-drop-el')
    while (tmpEl !== null) {
      document.body.removeChild(tmpEl)
      tmpEl = window.document.getElementById('files-drag-drop-el')
    }
  }
}
