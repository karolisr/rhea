<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { max } from '$lib'
import { v4 as uuid } from 'uuid'

onMount(() => {
  addEventListener('mousemove', resizeCol, { capture: true })
  addEventListener('mouseup', resizeColEnd, { capture: true })
  addEventListener('mousemove', resizeRow, { capture: true })
  addEventListener('mouseup', resizeRowEnd, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousemove', resizeCol, { capture: true })
  removeEventListener('mouseup', resizeColEnd, { capture: true })
  removeEventListener('mousemove', resizeRow, { capture: true })
  removeEventListener('mouseup', resizeRowEnd, { capture: true })
})

export let uid: string = uuid()

export let minRowH: number = 20
export let minColW: number = 20

export let rowHs: number[] = []
export let colWs: number[] = []

export let rowHsStr: string = ''
export let colWsStr: string = ''

export let firstRowResizable: boolean = true
export let firstColResizable: boolean = true

export let lastRowResizable: boolean = true
export let lastColResizable: boolean = true

$: rowHsStr = sizesStrFromSizes(rowHs, lastRowResizable)
$: colWsStr = sizesStrFromSizes(colWs, lastColResizable)

function sizesStrFromSizes(sizes: number[], lastResizable: boolean): string {
  let _ = ''
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i]
    if (size === -1 || (i === sizes.length - 1 && !lastResizable)) {
      _ += ` 1fr`
    } else {
      _ += ` ${size}px`
    }
  }
  return _.trim()
}

let colResizing: number | null = null
let colPrevX: number | null = null
let colPrevWidth: number | null = null

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

let rowResizing: number | null = null
let rowPrevY: number | null = null
let rowPrevHeight: number | null = null

function resizeRowBegin(evt: MouseEvent) {
  document.body.style.cursor = 'row-resize'
  rowPrevY = evt.y
  const row = Number(
    (evt.target as HTMLElement).id.replace(`${uid}-row-sizer-`, '')
  )
  rowPrevHeight = rowHs[row]
  rowResizing = row
}

function resizeRow(evt: MouseEvent) {
  if (rowResizing !== null) {
    const d = evt.y - (rowPrevY as number)
    rowHs[rowResizing as number] = max(minRowH, (rowPrevHeight as number) + d)
  }
}

function resizeRowEnd(_: MouseEvent) {
  if (rowResizing !== null) {
    rowResizing = null
    rowPrevY = null
    rowPrevHeight = null
    document.body.style.cursor = 'default'
  }
}
</script>

<div class="grid-sizers-container">
  <div
    class="grid-sizers"
    style:grid-template-rows="{rowHsStr}"
    style:grid-template-columns="{colWsStr}">
    {#if !firstColResizable}
      <resizer id="{uid}-col-sizer-disabled"></resizer>
    {/if}
    {#each colWs.slice(Number(!firstColResizable)) as _, i}
      {#if i === colWs.slice(Number(!firstColResizable)).length - 1 && !lastColResizable}
        <resizer id="{uid}-col-sizer-disabled"></resizer>
      {:else}
        <resizer
          id="{uid}-col-sizer-{i + Number(!firstColResizable)}"
          class="col-sizer"
          role="none"
          on:mousedown="{resizeColBegin}">
        </resizer>
      {/if}
    {/each}
  </div>

  <div
    class="grid-sizers"
    style:grid-template-rows="{rowHsStr}"
    style:grid-template-columns="{colWsStr}">
    {#if !firstRowResizable}
      <resizer id="{uid}-row-sizer-disabled"></resizer>
    {/if}
    {#each rowHs.slice(Number(!firstRowResizable)) as _, i}
      {#if i === rowHs.slice(Number(!firstRowResizable)).length - 1 && !lastRowResizable}
        <resizer id="{uid}-row-sizer-disabled"></resizer>
      {:else}
        <resizer
          id="{uid}-row-sizer-{i + Number(!firstRowResizable)}"
          class="row-sizer"
          role="none"
          on:mousedown="{resizeRowBegin}">
        </resizer>
      {/if}
    {/each}
  </div>
</div>

<style lang="scss">
.grid-sizers-container {
  pointer-events: none;
  // position: absolute;
  // top: 0;
  // bottom: 0;
  // left: 0;
  // right:0;
  position: sticky;
  display: flex;
  flex-direction: column;
  // overflow: hidden;
  // height: 100%;
  // width: 100%;
}

.grid-sizers {
  pointer-events: none;
  display: grid;
  position: absolute;
  // flex-grow: 1;
  // height: 100%;
  width: 100%;
  // margin: auto;
  // align-items: start;
  // align-content: center;
  // align-self: center;
  // text-align: center;
  // overflow: hidden;
}

.col-sizer {
  cursor: col-resize;
  pointer-events: fill;
  border-style: dashed;
  position: relative;
  width: 10px;
  // height: 10px;
  // height: 100%;
  // right: 0px;
  // left: 0px;
  top: 0;
  bottom: 0;
  margin-inline-start: auto;
  // margin-inline-end: auto;
  margin-block-start: auto;
  margin-block-end: auto;
  // rotate: 270deg;
}

.row-sizer {
  cursor: row-resize;
  pointer-events: fill;
  border-style: dashed;
  position: absolute;
  height: 10px;
  // width: 20px;
  // width: 100%;
  left: 0;
  right: 0;
  // margin-inline-start: auto;
  // margin-inline-end: auto;
  // margin-block-start: auto;
  // margin-block-end: auto;
  bottom: 0;
}
</style>
