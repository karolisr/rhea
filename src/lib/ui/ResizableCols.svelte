<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { max } from '$lib'

onMount(() => {
  addEventListener('mousemove', resizeCol, { capture: true })
  addEventListener('mouseup', resizeColEnd, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousemove', resizeCol, { capture: true })
  removeEventListener('mouseup', resizeColEnd, { capture: true })
})

export let minColW: number
export let uid: string
export let colWs: number[]
export let colWsStr: string
export let firstColResizable: boolean

let colResizing: number | null = null
let colPrevX: number | null = null
let colPrevWidth: number | null = null

$: colWsStr = colWStrFromColWs(colWs)

function colWStrFromColWs(colWs: number[]): string {
  let _ = ''
  colWs.forEach((w) => {
    _ += ` ${w}px`
  })
  return _.trim()
}

function resizeColBegin(evt: MouseEvent) {
  document.body.style.cursor = 'col-resize'
  colPrevX = evt.x
  const col = Number(
    (evt.target as HTMLElement).id.replace(`${uid}-col-sizer-`, '')
  )
  colPrevWidth = colWs[col]
  colResizing = col
}

function resizeCol(evt: MouseEvent) {
  if (colResizing !== null) {
    const d = evt.x - (colPrevX as number)
    colWs[colResizing as number] = max(minColW, (colPrevWidth as number) + d)
  }
}

function resizeColEnd(_: MouseEvent) {
  if (colResizing !== null) {
    colResizing = null
    colPrevX = null
    colPrevWidth = null
    document.body.style.cursor = 'default'
  }
}
</script>

<div
  id="{uid}-col-sizers"
  class="col-sizers"
  style:grid-template-columns="{colWsStr}">
  {#if !firstColResizable}
    <resizer id="{uid}-col-sizer-disabled"></resizer>
  {/if}
  {#each colWs.slice(Number(!firstColResizable)) as _, i}
    <resizer
      id="{uid}-col-sizer-{i + Number(!firstColResizable)}"
      class="col-sizer"
      role="none"
      on:mousedown="{resizeColBegin}">
    </resizer>
  {/each}
</div>

<style>
.col-sizers {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  pointer-events: none;
}

.col-sizer {
  position: relative;
  left: calc(100% - 12px);
  width: 12px;
  height: 100%;
  cursor: col-resize;
  pointer-events: fill;
}
</style>
