export class DragDrop {
  private drgEl1: HTMLElement | null = null
  private drgEl2: HTMLElement | null = null

  private dragging: boolean = false
  private draggingEnded: boolean = false

  private drgSourceEl: HTMLElement | null = null
  private drgTargetEl: HTMLElement | null = null
  private drgTargetElPrev: HTMLElement | null = null

  // private drgZ: number = 0
  // private drgSourceElXstart: number = 0
  // private drgSourceElYstart: number = 0
  // private drgSourceElXoffset: number = 0
  // private drgSourceElYoffset: number = 0

  #dStrtL: (e: MouseEvent) => void = this.#dragStartListener.bind(this)
  #mMoveL: (e: MouseEvent) => void = this.#mouseMoveEventListener.bind(this)
  #mOverL: (e: MouseEvent) => void = this.#mouseOverEventListener.bind(this)
  #dStopL: (e: MouseEvent) => void = this.#dragStopListener.bind(this)

  constructor() {
    addEventListener('mousemove', this.#mMoveL)
    addEventListener('mouseover', this.#mOverL)
    addEventListener('mouseup', this.#dStopL)
  }

  unlisten() {
    removeEventListener('mousemove', this.#mMoveL)
    removeEventListener('mouseover', this.#mOverL)
    removeEventListener('mouseup', this.#dStopL)
  }

  #prepDrgEl(el: HTMLElement | null) {
    if (el) {
      this.#clearDrgEl(el)
      el.addEventListener('mousedown', this.#dStrtL)
      // console.log('+', el.id)
    }
  }

  #clearDrgEl(el: HTMLElement | null) {
    if (el) {
      el.removeEventListener('mousedown', this.#dStrtL)
      // console.log('-', el.id)
    }
  }

  #mouseMoveEventListener(e: MouseEvent) {
    // if (this.dragging && this.drgSourceEl) {
    //   this.drgSourceEl.style.position = 'absolute'
    //   this.drgSourceEl.style.left = `${e.x - this.drgSourceElXoffset}px`
    //   this.drgSourceEl.style.top = `${e.y - this.drgSourceElYoffset}px`
    // }
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
        document.body.style.cursor = 'grab'
      } else {
        this.drgEl2 = e.target
      }
    } else {
      if (this.draggingEnded) {
        this.draggingEnded = false
        return
      }
      if (!this.dragging) {
        document.body.style.cursor = 'default'
      }
      this.drgEl1 = null
      this.drgEl2 = null
    }

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
        this.drgTargetEl.classList.add('drag-item-hovering')
        document.body.style.cursor = 'copy'
      } else if (this.drgTargetElPrev) {
        this.drgTargetElPrev.classList.remove('drag-item-hovering')
        document.body.style.cursor = 'grabbing'
      }
    }
  }

  #dragStartListener(e: MouseEvent) {
    if (e.target === this.drgEl1) {
      this.drgSourceEl = this.drgEl1
      document.body.style.cursor = 'grabbing'
      this.dragging = true
      this.drgEl2 = this.drgEl1
      // if (this.drgSourceEl) {
      //   this.drgZ += 2
      //   this.drgSourceEl.style.pointerEvents = 'none'
      //   this.drgSourceEl.style.zIndex = `${this.drgZ}`
      //   this.drgSourceElXstart = this.drgSourceEl?.getBoundingClientRect().left
      //   this.drgSourceElYstart = this.drgSourceEl?.getBoundingClientRect().top
      //   this.drgSourceElXoffset = e.clientX - this.drgSourceElXstart
      //   this.drgSourceElYoffset = e.clientY - this.drgSourceElYstart
      // }
      console.log(`Dragging: ${this.drgSourceEl?.id}`)
    }
  }

  #dragStopListener(e: MouseEvent) {
    if (this.dragging) {
      // if (this.drgSourceEl) {
      //   this.drgZ -= 1
      //   this.drgSourceEl.style.pointerEvents = 'auto'
      //   this.drgSourceEl.style.zIndex = `${this.drgZ}`
      // }
      let flag = true
      if (this.drgEl1 === this.drgEl2) flag = false
      // this.clearDrgEl(this.drgEl1)
      this.drgEl1 = this.drgEl2
      this.#prepDrgEl(this.drgEl1)
      this.drgEl2 = null
      this.dragging = false

      if (this.drgEl1) {
        document.body.style.cursor = 'grab'
        if (flag) this.draggingEnded = true
      } else {
        document.body.style.cursor = 'default'
      }
      if (
        this.drgTargetEl &&
        this.drgTargetEl.id &&
        this.drgTargetEl.classList.contains('drag-target') &&
        this.drgSourceEl !== this.drgTargetEl
      ) {
        console.log(
          `Dropped: ${this.drgSourceEl?.id} / ${this.drgTargetEl?.id}`
        )
        if (this.drgTargetEl)
          this.drgTargetEl.classList.remove('drag-item-hovering')
        this.drgSourceEl = null
        this.drgTargetEl = null
      } else {
        console.log(`Dragging cancelled: ${this.drgSourceEl?.id}`)
        if (this.drgTargetEl)
          this.drgTargetEl.classList.remove('drag-item-hovering')
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
  }
}
