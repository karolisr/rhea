<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { v4 as uuid } from 'uuid'
import { max, min } from '$lib'

export let nRow: number = 0
export let nCol: number = 0

onMount(() => {
  addEventListener('mousemove', resizeCol, { capture: true })
  addEventListener('mouseup', resizeGridElementEnd, { capture: true })
  addEventListener('mousemove', resizeRow, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousemove', resizeCol, { capture: true })
  removeEventListener('mouseup', resizeGridElementEnd, { capture: true })
  removeEventListener('mousemove', resizeRow, { capture: true })
})

export let uid: string = uuid()
export let minRowH: number
export let minColW: number
export let rowHs: number[]
export let colWs: number[]
export let rowHsStr: string
export let colWsStr: string
export let sizerSize: number = 11
export let rowsResizable: boolean = true
export let colsResizable: boolean = true
export let enforceMaxSize: boolean = true
export let fixedHRows: number[] = []
export let fixedWCols: number[] = []

$: rowHsStr = sizesStrFromSizes(rowHs)
$: colWsStr = sizesStrFromSizes(colWs)

function sizesStrFromSizes(sizes: number[]): string {
  let _ = ''
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i]
    if (size === -1) {
      _ += ` auto`
    } else {
      _ += ` ${size}px`
    }
  }
  return _.trim()
}

let colResizing: number | null = null
let colPrevX: number | null = null
let colPrevWidth: number | null = null
let colMaxW: number | null = null

let rowResizing: number | null = null
let rowPrevY: number | null = null
let rowPrevHeight: number | null = null
let rowMaxH: number | null = null

function resizeGridElementBegin(evt: MouseEvent) {
  const el = evt.target as HTMLElement
  const elParent = el.parentElement?.parentElement as HTMLElement
  const elType = (el.id.match(/\-(col|row)\-/) as string[])[1] as 'col' | 'row'
  const elIndex = Number(el.id.replace(`${uid}-${elType}-sizer-`, ''))
  document.body.style.cursor = `${elType}-resize`

  let n: number = 0
  let minSize: number = 0
  let sizes: number[] = []

  switch (elType) {
    case 'row':
      rowResizing = elIndex
      rowPrevY = evt.y
      rowPrevHeight = rowHs[elIndex]
      n = nRow
      minSize = minRowH
      sizes = rowHs
      break

    case 'col':
      colResizing = elIndex
      colPrevX = evt.x
      colPrevWidth = colWs[elIndex]
      n = nCol
      minSize = minColW
      sizes = colWs
      break

    default:
      break
  }

  let maxSize: number = 0
  let maxSizeOffset: number = 0
  if (!enforceMaxSize) {
    maxSizeOffset = 20000
  } else {
    for (let i = 0; i < n; i++) {
      const elOther = document.getElementById(
        `${uid}-${elType}-sizer-${i}`
      ) as HTMLElement
      if (elOther) {
        if (sizes[i] === -1) {
          maxSize += minSize
        } else {
          if (i !== elIndex) {
            maxSize += sizes[i]
          } else {
            maxSize += minSize
          }
        }
      }
    }
  }

  switch (elType) {
    case 'row':
      rowMaxH = elParent.offsetHeight - maxSize + maxSizeOffset
      break

    case 'col':
      colMaxW = elParent.offsetWidth - maxSize + maxSizeOffset
      break

    default:
      break
  }
}

function resizeCol(evt: MouseEvent) {
  if (colResizing !== null) {
    const d = evt.x - (colPrevX as number)
    colWs[colResizing as number] = min(
      max(minColW, (colPrevWidth as number) + d),
      colMaxW as number
    )
  }
}

function resizeRow(evt: MouseEvent) {
  if (rowResizing !== null) {
    const d = evt.y - (rowPrevY as number)
    rowHs[rowResizing as number] = min(
      max(minRowH, (rowPrevHeight as number) + d),
      rowMaxH as number
    )
  }
}

function resizeGridElementEnd(_: MouseEvent) {
  if (colResizing !== null) {
    colResizing = null
    colPrevX = null
    colPrevWidth = null
    colMaxW = null
  }

  if (rowResizing !== null) {
    rowResizing = null
    rowPrevY = null
    rowPrevHeight = null
    rowMaxH = null
  }

  document.body.style.cursor = 'default'
}
</script>

<div
  class="grid-sizers"
  style:grid-row="1/{nRow + 1}"
  style:grid-column="1/{nCol + 1}">
  {#if rowsResizable}
    {#each rowHs as rowH, row}
      {#if rowH !== -1}
        <grid-sizer-h
          style:grid-row="{row + 1}/{row + 2}"
          style:grid-column="1/{nCol + 1}">
          <div
            id="{uid}-row-sizer-{row}"
            on:mousedown="{resizeGridElementBegin}"
            role="none"
            style:top="{rowHs[row] - sizerSize / 2}px"
            style:height="{sizerSize}px">
          </div>
        </grid-sizer-h>
      {/if}
    {/each}
  {/if}
  {#if colsResizable}
    {#each colWs as colW, col}
      {#if colW !== -1 && !fixedWCols.includes(col)}
        <grid-sizer-v
          style:grid-row="1/{nRow + 1}"
          style:grid-column="{col + 1}/{col + 2}">
          <div
            id="{uid}-col-sizer-{col}"
            on:mousedown="{resizeGridElementBegin}"
            role="none"
            style:left="{colWs[col] - 0.5 - sizerSize / 2}px"
            style:width="{sizerSize}px">
          </div>
        </grid-sizer-v>
      {/if}
    {/each}
  {/if}
</div>

<style lang="scss">
.grid-sizers {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: subgrid;
  pointer-events: none;
}

grid-sizer-h {
}

grid-sizer-h > div {
  cursor: row-resize;
  position: relative;
  width: 100%;
  pointer-events: all;
}

grid-sizer-v {
}

grid-sizer-v > div {
  cursor: col-resize;
  position: relative;
  height: 100%;
  pointer-events: all;
}
</style>
