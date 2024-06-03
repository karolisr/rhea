import type { DragStartEvent, DragOverEvent, DropEvent, DragDropPayload } from './types'

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
  // private showWhileDraggingEl: HTMLElement | null = null

  // private drgZ: number = 0
  private drgSourceElXstart: number = 0
  private drgSourceElYstart: number = 0
  private drgSourceElXoffset: number = 0
  private drgSourceElYoffset: number = 0

  constructor() {
    addEventListener('mousemove', this.#mMoveL)
    addEventListener('mouseover', this.#mOverL)
    addEventListener('mouseup', this.#dStopL)

    console.log('DragDrop: listen')
  }

  unlisten() {
    removeEventListener('mousemove', this.#mMoveL)
    removeEventListener('mouseover', this.#mOverL)
    removeEventListener('mouseup', this.#dStopL)

    console.log('DragDrop: unlisten')
  }

  #dStrtL: (e: MouseEvent) => void = this.#dragStartListener.bind(this)
  #mMoveL: (e: MouseEvent) => void = this.#mouseMoveEventListener.bind(this)
  #mOverL: (e: MouseEvent) => void = this.#mouseOverEventListener.bind(this)
  #dStopL: (e: MouseEvent) => void = this.#dragStopListener.bind(this)

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
    if (e.target instanceof HTMLElement && e.target.classList.contains('draggable')) {
      this.draggingEnded = false
      if (!this.dragging) {
        this.drgEl1 = e.target
        this.#prepDrgEl(this.drgEl1)
        // document.body.style.cursor = 'grab'
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

    if (this.dragging && (e.target instanceof HTMLElement || e.target === null)) {
      this.drgTargetElPrev = this.drgTargetEl
      this.drgTargetEl = e.target
      if (this.drgTargetEl && this.drgTargetEl.classList.contains('drag-target')) {
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
        // document.body.style.cursor = 'grabbing'
        document.body.style.cursor = 'default'
      }
    }
  }

  #dragStartListener(e: MouseEvent) {
    if (e.target === this.drgEl1) {
      this.drgSourceEl = this.drgEl1
      this.beforeDrag = 0
      this.drgEl2 = this.drgEl1
      if (this.drgSourceEl) {
        //   this.drgZ += 2
        //   this.drgSourceEl.style.pointerEvents = 'none'
        //   this.drgSourceEl.style.zIndex = `${this.drgZ}`
        this.drgSourceElXstart = this.drgSourceEl?.getBoundingClientRect().left
        this.drgSourceElYstart = this.drgSourceEl?.getBoundingClientRect().top
        this.drgSourceElXoffset = e.clientX - this.drgSourceElXstart
        this.drgSourceElYoffset = e.clientY - this.drgSourceElYstart
      }
    }
  }

  #mouseMoveEventListener(e: MouseEvent) {
    const drgOffsetX = -1
    const drgOffsetY = -25
    if (this.beforeDrag >= 0) this.beforeDrag += 1
    if (this.beforeDrag > 5 && this.drgSourceEl) {
      // document.body.style.cursor = 'grabbing'
      document.body.style.cursor = 'default'
      this.beforeDrag = -1
      this.dragging = true
      console.log(`Dragging: ${this.drgSourceEl?.id}`)
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
      // } else if (this.dragging && this.drgTargetEl) {
      //   if (!this.payload.targetCanAccept) document.body.style.cursor = 'no-drop'
    } else if (this.payload.showWhileDraggingEl !== null) {
      const el = this.payload.showWhileDraggingEl
      el.style.opacity = '1'
      el.style.left = `${e.x + drgOffsetX}px`
      el.style.top = `${e.y + drgOffsetY}px`
      // el.style.left = `${e.x - this.drgSourceElXoffset}px`
      // el.style.top = `${e.y - this.drgSourceElYoffset}px`
    } else {
      //
    }
  }

  #dragStopListener(e: MouseEvent) {
    this.beforeDrag = -1

    if (this.payload.showWhileDraggingEl !== null) {
      const el = this.payload.showWhileDraggingEl
      el.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(el)
      }, 250)
    }

    if (this.drgEl1) {
      // document.body.style.cursor = 'grab'
      document.body.style.cursor = 'default'
    } else {
      document.body.style.cursor = 'default'
    }

    if (this.dragging) {
      // if (this.drgSourceEl) {
      //   this.drgZ -= 1
      //   this.drgSourceEl.style.pointerEvents = 'auto'
      //   this.drgSourceEl.style.zIndex = `${this.drgZ}`
      // }
      let flag = true
      if (this.drgEl1 === this.drgEl2) flag = false
      this.drgEl1 = this.drgEl2
      this.#prepDrgEl(this.drgEl1)
      this.drgEl2 = null
      this.dragging = false

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
        console.log(`Dropped: ${this.drgSourceEl?.id} / ${this.drgTargetEl?.id}`)

        const dropEv = new Event('drop') as DropEvent
        dropEv.payload = this.payload
        this.drgTargetEl.dispatchEvent(dropEv)

        if (this.drgTargetEl) this.drgTargetEl.classList.remove('drag-item-hovering')
        this.drgSourceEl = null
        this.drgTargetEl = null
      } else {
        console.log(`Dragging cancelled: ${this.drgSourceEl?.id}`)
        if (this.drgTargetEl) this.drgTargetEl.classList.remove('drag-item-hovering')
        if (this.drgSourceEl) {
          this.drgSourceEl = null
          this.drgTargetEl = null
          // this.drgSourceEl.style.transition = 'all 150ms ease'
          // this.drgSourceEl.style.left = `${this.drgSourceElXstart}px`
          // this.drgSourceEl.style.top = `${this.drgSourceElYstart}px`
          // setTimeout(() => {
          //   if (this.drgSourceEl) {
          //     this.drgSourceEl.style.position = 'unset'
          //     this.drgSourceEl.style.left = 'unset'
          //     this.drgSourceEl.style.top = 'unset'
          //     this.drgSourceEl.style.transition = 'unset'
          //     this.drgSourceEl = null
          //     this.drgTargetEl = null
          //   }
          // }, 130)
        }
      }
    } else {
      this.draggingEnded = true
    }
    this.payload = this.defaultPayload
  }
}
