<script lang="ts">
import { onDestroy, onMount } from 'svelte'

let drgEl1: HTMLElement | null = null
let drgEl2: HTMLElement | null = null
let dragging: boolean = false
let draggingEnded: boolean = false

let drgSourceEl: HTMLElement | null = null
let drgTargetEl: HTMLElement | null = null

let drgSourceElXstart: number = 0
let drgSourceElYstart: number = 0
let drgZ: number = 0

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

  if (e.target instanceof HTMLElement || e.target === null) {
    drgTargetEl = e.target
  }
}

function customDragStartListener(e: MouseEvent) {
  drgSourceEl = drgEl1
  document.body.style.cursor = 'grabbing'
  dragging = true
  drgEl2 = drgEl1
  if (drgSourceEl) {
    drgZ += 2
    drgSourceEl.style.pointerEvents = 'none'
    drgSourceEl.style.zIndex = `${drgZ}`
    drgSourceElXstart = e.clientX - drgSourceEl?.getBoundingClientRect().left
    drgSourceElYstart = e.clientY - drgSourceEl?.getBoundingClientRect().top
  }
  // console.log(`Dragging ${drgSourceEl?.id}`)
}

function customDragStopListener(e: MouseEvent) {
  if (dragging) {
    if (drgSourceEl) {
      drgZ -= 1
      drgSourceEl.style.pointerEvents = 'auto'
      drgSourceEl.style.zIndex = `${drgZ}`
    }
    let flag = true
    if (drgEl1 === drgEl2) flag = false
    clearDrgEl(drgEl1)
    drgEl1 = drgEl2
    prepDrgEl(drgEl1)
    drgEl2 = null
    dragging = false
    drgSourceElXstart = 0
    drgSourceElYstart = 0
    if (drgEl1) {
      document.body.style.cursor = 'grab'
      if (flag) draggingEnded = true
    } else {
      document.body.style.cursor = 'default'
    }
    if (drgTargetEl && drgTargetEl.id && drgSourceEl !== drgTargetEl) {
      // console.log(`Dropped ${drgSourceEl?.id} on ${drgTargetEl?.id}`)
    } else {
      // console.log(`Dragging ${drgSourceEl?.id} was canceled.`)
      if (drgSourceEl) {
        drgSourceEl.style.position = 'unset'
        drgSourceEl.style.left = 'unset'
        drgSourceEl.style.top = 'unset'
      }
    }
  } else {
    draggingEnded = true
  }
}

function mouseMoveEventListener(e: MouseEvent) {
  if (dragging && drgSourceEl) {
    drgSourceEl.style.position = 'absolute'
    drgSourceEl.style.left = `${e.x - drgSourceElXstart}px`
    drgSourceEl.style.top = `${e.y - drgSourceElYstart}px`
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
  <div id="target"></div>
</div>

<style>
.container {
  display: flex;
  flex-direction: row;
  margin: auto;
  gap: 20px;
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
