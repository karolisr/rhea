<script lang="ts">
import { onDestroy, onMount } from 'svelte'

let drgEl1: HTMLElement | null = null
let drgEl2: HTMLElement | null = null
let dragging: boolean = false
let draggingEnded: boolean = false

let drgSourceEl: HTMLElement | null = null
let drgTargetEl: HTMLElement | null = null
let drgTargetElPrev: HTMLElement | null = null
drgTargetElPrev

// let drgZ: number = 0
// let drgSourceElXstart: number = 0
// let drgSourceElYstart: number = 0
// let drgSourceElXoffset: number = 0
// let drgSourceElYoffset: number = 0

// $: console.log(drgSourceEl?.id, drgTargetEl?.id)

function prepDrgEl(el: HTMLElement | null) {
  if (el) el.addEventListener('mousedown', customDragStartListener, true)
}

function clearDrgEl(el: HTMLElement | null) {
  if (el) el.removeEventListener('mousedown', customDragStartListener, true)
}

function mouseOverEventListener(e: MouseEvent) {
  if (
    e.target instanceof HTMLElement &&
    e.target.classList.contains('draggable')
  ) {
    draggingEnded = false
    if (!dragging) {
      drgEl1 = e.target
      prepDrgEl(drgEl1)
      document.body.style.cursor = 'grab'
    } else {
      drgEl2 = e.target
    }
  } else {
    if (draggingEnded) {
      draggingEnded = false
      return
    }
    if (!dragging) {
      document.body.style.cursor = 'default'
    }
    drgEl1 = null
    drgEl2 = null
  }

  if (dragging && (e.target instanceof HTMLElement || e.target === null)) {
    drgTargetElPrev = drgTargetEl
    drgTargetEl = e.target
    if (drgTargetEl && drgTargetEl.classList.contains('drag-target')) {
      drgTargetEl.classList.add('drag-item-hovering')
    } else if (drgTargetElPrev) {
      drgTargetElPrev.classList.remove('drag-item-hovering')
    }
  }
}

function customDragStartListener(e: MouseEvent) {
  drgSourceEl = drgEl1
  document.body.style.cursor = 'grabbing'
  dragging = true
  drgEl2 = drgEl1
  if (drgSourceEl) {
    // drgZ += 2
    // drgSourceEl.style.pointerEvents = 'none'
    // drgSourceEl.style.zIndex = `${drgZ}`
    // drgSourceElXstart = drgSourceEl?.getBoundingClientRect().left
    // drgSourceElYstart = drgSourceEl?.getBoundingClientRect().top
    // drgSourceElXoffset = e.clientX - drgSourceElXstart
    // drgSourceElYoffset = e.clientY - drgSourceElYstart
  }
  console.log(`Dragging: ${drgSourceEl?.id}`)
}

function mouseMoveEventListener(e: MouseEvent) {
  if (dragging && drgSourceEl) {
    // drgSourceEl.style.position = 'absolute'
    // drgSourceEl.style.left = `${e.x - drgSourceElXoffset}px`
    // drgSourceEl.style.top = `${e.y - drgSourceElYoffset}px`
  }
}

function customDragStopListener(e: MouseEvent) {
  if (dragging) {
    if (drgSourceEl) {
      // drgZ -= 1
      // drgSourceEl.style.pointerEvents = 'auto'
      // drgSourceEl.style.zIndex = `${drgZ}`
    }
    let flag = true
    if (drgEl1 === drgEl2) flag = false
    clearDrgEl(drgEl1)
    drgEl1 = drgEl2
    prepDrgEl(drgEl1)
    drgEl2 = null
    dragging = false

    if (drgEl1) {
      document.body.style.cursor = 'grab'
      if (flag) draggingEnded = true
    } else {
      document.body.style.cursor = 'default'
    }
    if (
      drgTargetEl &&
      drgTargetEl.id &&
      drgTargetEl.classList.contains('drag-target') &&
      drgSourceEl !== drgTargetEl
    ) {
      console.log(`Dropped: ${drgSourceEl?.id} / ${drgTargetEl?.id}`)
      if (drgTargetEl) drgTargetEl.classList.remove('drag-item-hovering')
      drgSourceEl = null
      drgTargetEl = null
    } else {
      console.log(`Dragging cancelled: ${drgSourceEl?.id}`)
      if (drgTargetEl) drgTargetEl.classList.remove('drag-item-hovering')
      if (drgSourceEl) {
        drgSourceEl = null
        drgTargetEl = null
        // drgSourceEl.style.transition = 'all 150ms ease'
        // drgSourceEl.style.left = `${drgSourceElXstart}px`
        // drgSourceEl.style.top = `${drgSourceElYstart}px`
        // setTimeout(() => {
        //   if (drgSourceEl) {
        //     drgSourceEl.style.position = 'unset'
        //     drgSourceEl.style.left = 'unset'
        //     drgSourceEl.style.top = 'unset'
        //     drgSourceEl.style.transition = 'unset'
        //     drgSourceEl = null
        //     drgTargetEl = null
        //   }
        // }, 130)
      }
    }
  } else {
    draggingEnded = true
  }
}

onMount(() => {
  addEventListener('mousemove', mouseMoveEventListener, true)
  addEventListener('mouseover', mouseOverEventListener, true)
  addEventListener('mouseup', customDragStopListener, true)
})
onDestroy(() => {
  removeEventListener('mousemove', mouseMoveEventListener, true)
  removeEventListener('mouseover', mouseOverEventListener, true)
  removeEventListener('mouseup', customDragStopListener, true)
})
</script>

<div id="container" class="container">
  <div id="source">
    <div id="item1" class="item draggable">Item 1</div>
    <div id="item2" class="item draggable">Item 2</div>
    <div id="item3" class="item draggable">Item 3</div>
    <div id="item4" class="item draggable">Item 4</div>
  </div>
  <div id="target" class="drag-target"></div>
</div>

<style>
.container {
  display: flex;
  flex-direction: row;
  margin: auto;
  gap: 20px;
  transition: all 1000ms ease;
}

#target {
  margin: auto;
  width: 200px;
  height: 100px;
  padding: 20px;
  border-style: solid;
  background-color: antiquewhite;
}

.item {
  padding: 10px;
  background-color: aliceblue;
  border-style: solid;
  width: 100px;
}

#source {
  border-style: solid;
}

.item:hover {
  background-color: azure;
}

.item:active {
  background-color: lavenderblush;
}
</style>
