<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import type {
  DragStartEvent,
  DragOverEvent,
  DropEvent,
  DragDropPayload
} from '$lib/app/api/types'

let targetEl: HTMLElement | null = null
let payload: DragDropPayload | null = null

onMount(() => {
  targetEl = document.getElementById('target')
})

onDestroy(() => {})

$: if (targetEl && payload) targetEl.innerText = payload.data as string

function onDragStart(e: Event) {
  const ev = e as DragStartEvent
  ev.payload.type = 'some-type'
  const el = ev.payload.showWhileDraggingEl as HTMLElement
  el.style.borderStyle = 'solid'
  el.style.backgroundColor = 'yellow'
  el.innerText = ev.payload.data as string
  // ev.payload.data = 'Y'
  // console.log('onDragStart:', e)
}

function onDragOver(e: Event) {
  const ev = e as DragOverEvent
  if (ev.payload.type !== 'some-type') {
    ev.payload.targetCanAccept = false
  } else {
    ev.payload.targetCanAccept = true
  }
}

function onDrop(e: Event) {
  const ev = e as DropEvent
  if (ev.payload.type === 'some-type') payload = ev.payload
  // console.log('onDrop:', ev.payload)
}
</script>

<div id="container" class="container">
  <div id="source">
    <div
      id="item1"
      class="item draggable"
      on:dragstart="{onDragStart}"
      role="region">
      Item 1
    </div>
    <div
      id="item2"
      class="item draggable"
      on:dragstart="{onDragStart}"
      role="region">
      Item 2
    </div>
    <div
      id="item3"
      class="item draggable"
      on:dragstart="{onDragStart}"
      role="region">
      Item 3
    </div>
    <div
      id="item4"
      class="item draggable"
      on:dragstart="{onDragStart}"
      role="region">
      Item 4
    </div>
  </div>
  <div
    id="target"
    class="drag-target"
    on:drop="{onDrop}"
    on:dragenter="{onDragOver}"
    role="region">
  </div>
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
