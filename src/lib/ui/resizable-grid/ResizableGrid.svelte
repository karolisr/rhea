<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte'
import { makeGridTemplate } from '.'

const floor = Math.floor

export let uid: string
export let rowHs: number[]
export let colWs: number[]
export let minRowH: number = 0
export let minColW: number = 0
export let sizerSize: number = 10
export let rowsResizable: boolean = true
export let colsResizable: boolean = true
export let fixedHRows: number[] = []
export let fixedWCols: number[] = []

let collapsedRows: boolean[] = rowHs.map(() => false)
let collapsedCols: boolean[] = colWs.map(() => false)

// bind these to get calculated sizes for grid elements
export let rowHsCalc: number[] | undefined = undefined
export let colWsCalc: number[] | undefined = undefined

export let gridTemplateRows: string = ''
export let gridTemplateCols: string = ''

let element: Element
let w: number
let h: number

let rowBorders: boolean[] = []
let colBorders: boolean[] = []

$: {
  const _1 = makeGridTemplate(rowHs, h)
  const _2 = makeGridTemplate(colWs, w)

  const _rowHsCalc = _1.calculatedSizes
  const _colWsCalc = _2.calculatedSizes

  if (_rowHsCalc !== null && _colWsCalc !== null) {
    let ok: boolean = false
    if (rowHsCalc !== undefined || colWsCalc !== undefined) {
      if (rowHsCalc !== undefined) {
        for (let i = 0; i < _rowHsCalc.length; i++) {
          const prev = rowHsCalc[i]
          const curr = _rowHsCalc[i]
          if (prev !== curr) {
            ok = true
            break
          }
        }
      }
      if (colWsCalc !== undefined) {
        for (let i = 0; i < _colWsCalc.length; i++) {
          const prev = colWsCalc[i]
          const curr = _colWsCalc[i]
          if (prev !== curr) {
            ok = true
            break
          }
        }
      }
    } else {
      ok = true
    }

    if (ok) {
      rowHsCalc = _rowHsCalc
      colWsCalc = _colWsCalc

      gridTemplateRows = _1.gridTemplate
      gridTemplateCols = _2.gridTemplate

      const _colBorders = colWsCalc.map((w) => w > 0)
      if (colWs[colWs.length - 1] < 0) {
        colBorders = _colBorders.slice(0, -1)
      } else {
        colBorders = _colBorders
      }

      const _rowBorders = rowHsCalc.map((h) => h > 0)
      if (rowHs[rowHs.length - 1] < 0) {
        rowBorders = _rowBorders.slice(0, -1)
      } else {
        rowBorders = _rowBorders
      }
    }
  }
}

onMount(() => {
  addEventListener('resize', resizeListener)
  addEventListener('mousemove', resizeCol)
  addEventListener('mousemove', resizeRow)
  addEventListener('mouseup', resizeGridElementEnd)
  dispatchResizeEvent()
  updateElementSize()
})

onDestroy(() => {
  removeEventListener('resize', resizeListener)
  removeEventListener('mousemove', resizeCol)
  removeEventListener('mousemove', resizeRow)
  removeEventListener('mouseup', resizeGridElementEnd)
})

async function updateElementSize() {
  await tick()
  if (element) {
    const rects = element.getClientRects()
    const _w = floor(rects[0].width)
    if (_w !== w) {
      w = _w
    }
    const _h = floor(rects[0].height)
    if (_h !== h) {
      h = _h
    }
  }
}

function resizeListener(e: CustomEvent | Event) {
  if (
    (e instanceof CustomEvent && e.detail !== uid) ||
    !(e instanceof CustomEvent)
  ) {
    updateElementSize()
  }
}

const resizeEvt = new CustomEvent('resize', { detail: uid })
function dispatchResizeEvent() {
  dispatchEvent(resizeEvt)
}

let colResizing: number | null = null
let colPrevX: number | null = null
let colPrevWidth: number | null = null
let colMaxW: number | null = null

let rowResizing: number | null = null
let rowPrevY: number | null = null
let rowPrevHeight: number | null = null
let rowMaxH: number | null = null

function resizeGridElementBegin(e: MouseEvent) {
  const el = e.target as HTMLElement
  const elType = (el.id.match(/\-(col|row)\-/) as string[])[1] as 'col' | 'row'
  const elIndex = Number(el.id.replace(`${uid}-${elType}-sizer-`, ''))
  document.body.style.cursor = `${elType}-resize`

  let n: number = 0
  let minSize: number = 0
  let sizes: number[] = []

  switch (elType) {
    case 'row':
      rowResizing = elIndex
      rowPrevY = e.y
      rowPrevHeight = rowHs[elIndex]
      n = rowHs.length
      minSize = minRowH
      sizes = rowHs
      break

    case 'col':
      colResizing = elIndex
      colPrevX = e.x
      colPrevWidth = colWs[elIndex]
      n = colWs.length
      minSize = minColW
      sizes = colWs
      break

    default:
      break
  }

  let maxSize: number = 0
  let maxSizeOffset: number = 0

  for (let i = 0; i < n; i++) {
    const elOther = document.getElementById(
      `${uid}-${elType}-sizer-${i}`
    ) as HTMLElement
    if (elOther) {
      if (i !== elIndex) {
        maxSize += sizes[i]
      } else if (sizes[i] < 0) {
        maxSize += minSize
      }
    }
  }

  switch (elType) {
    case 'row':
      if (h !== undefined) rowMaxH = h - maxSize + maxSizeOffset
      break

    case 'col':
      if (w !== undefined) colMaxW = w - maxSize + maxSizeOffset
      break

    default:
      break
  }
}

function resizeRow(e: MouseEvent) {
  e.stopPropagation()
  if (rowResizing !== null) {
    const d = e.y - (rowPrevY as number)
    let newRowH = Math.min(
      Math.max(minRowH, (rowPrevHeight as number) + d),
      rowMaxH as number
    )
    if (newRowH <= minRowH) {
      newRowH = 0
      collapsedRows[rowResizing] = true
    } else {
      collapsedRows[rowResizing] = false
    }
    rowHs[rowResizing] = newRowH
    dispatchResizeEvent()
  }
}

function resizeCol(e: MouseEvent) {
  e.stopPropagation()
  if (colResizing !== null) {
    const d = e.x - (colPrevX as number)
    let newColW = Math.min(
      Math.max(minColW, (colPrevWidth as number) + d),
      colMaxW as number
    )
    if (newColW <= minColW) {
      newColW = 0
      collapsedCols[colResizing] = true
    } else {
      collapsedCols[colResizing] = false
    }
    colWs[colResizing] = newColW
    dispatchResizeEvent()
  }
}

function resizeGridElementEnd(e: MouseEvent) {
  e.stopPropagation()
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
  dispatchResizeEvent()
}

let rowHsPrev: number[] = []
let colWsPrev: number[] = []

function collapseGridElement(e: MouseEvent) {
  let elementIndex: number | null = null
  let sizes: number[] | null = null
  let prevSizes: number[] | null = null
  let minSize: number | null = null
  let collapsed: boolean[] | null = null

  resizeGridElementBegin(e)

  if (colResizing !== null) {
    elementIndex = colResizing as number
    sizes = colWs
    prevSizes = colWsPrev
    minSize = minColW
    collapsed = collapsedCols
  } else if (rowResizing !== null) {
    elementIndex = rowResizing as number
    sizes = rowHs
    prevSizes = rowHsPrev
    minSize = minRowH
    collapsed = collapsedRows
  }

  if (
    elementIndex !== null &&
    sizes !== null &&
    prevSizes !== null &&
    minSize !== null &&
    collapsed !== null
  ) {
    if (!collapsed[elementIndex]) {
      prevSizes[elementIndex] = sizes[elementIndex]
      collapsed[elementIndex] = true
      sizes[elementIndex] = 0
    } else {
      if (
        prevSizes[elementIndex] === 0 ||
        prevSizes[elementIndex] === undefined
      ) {
        prevSizes[elementIndex] = minSize
      }
      collapsed[elementIndex] = false
      sizes[elementIndex] = prevSizes[elementIndex]
    }
  }

  if (colResizing !== null) {
    colWs = sizes as number[]
    colWsPrev = prevSizes as number[]
    collapsedCols = collapsed as boolean[]
  } else if (rowResizing !== null) {
    rowHs = sizes as number[]
    rowHsPrev = prevSizes as number[]
    collapsedRows = collapsed as boolean[]
  }

  resizeGridElementEnd(e)
}
</script>

<grid-container
  bind:this="{element}"
  style:grid-template-rows="{gridTemplateRows}"
  style:grid-template-columns="{gridTemplateCols}">
  <grid-items
    style:grid-row="1/{rowHs.length + 1}"
    style:grid-column="1/{colWs.length + 1}">
    <slot />
  </grid-items>
  <grid-sizers
    style:grid-row="1/{rowHs.length + 1}"
    style:grid-column="1/{colWs.length + 1}">
    {#if rowHsCalc !== undefined && colWsCalc !== undefined}
      {#each rowHs as rowH, row}
        <grid-row-sizer-container
          style:grid-row="{row + 1}/{row + 2}"
          style:grid-column="1/{colWs.length + 1}"
          class="
        {rowsResizable ? 'resizable' : ''}
        {rowBorders[row] && rowHsCalc[row] > 0 ? ' border' : ''}
        {collapsedRows[row] ? ' collapsed' : ''}">
          {#if rowH >= 0 && !fixedHRows.includes(row)}
            <grid-row-sizer
              id="{uid}-row-sizer-{row}"
              on:mousedown="{resizeGridElementBegin}"
              on:dblclick="{collapseGridElement}"
              role="none"
              style:height="{sizerSize}px"
              style:margin-block-end="
              {collapsedRows[row] ? -sizerSize : -sizerSize / 2 - 0.5}px">
            </grid-row-sizer>
          {/if}
        </grid-row-sizer-container>
      {/each}

      {#each colWs as colW, col}
        <grid-col-sizer-container
          style:grid-row="1/{rowHs.length + 1}"
          style:grid-column="{col + 1}/{col + 2}"
          class="
        {colsResizable ? 'resizable' : ''}
        {colBorders[col] && colWsCalc[col] > 0 ? ' border' : ''}
        {collapsedCols[col] ? ' collapsed' : ''}">
          {#if colW >= 0 && !fixedWCols.includes(col)}
            <grid-col-sizer
              id="{uid}-col-sizer-{col}"
              on:mousedown="{resizeGridElementBegin}"
              on:dblclick="{collapseGridElement}"
              role="none"
              style:width="{sizerSize}px"
              style:margin-inline-end="
              {collapsedCols[col] ? -sizerSize : -sizerSize / 2 - 0.5}px">
            </grid-col-sizer>
          {/if}
        </grid-col-sizer-container>
      {/each}
    {/if}
  </grid-sizers>
</grid-container>

<style lang="scss">
grid-container {
  flex-grow: 1;
  flex-shrink: 1;
  display: grid;
  overflow: hidden;
}

grid-items {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: subgrid;
}

grid-sizers {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: subgrid;
  pointer-events: none;
}

grid-row-sizer-container,
grid-col-sizer-container {
  display: flex;
  background-color: transparent;
}

grid-row-sizer-container {
  flex-direction: column-reverse;
}

grid-col-sizer-container {
  flex-direction: row-reverse;
}

grid-row-sizer-container.border {
  margin-block-end: -0.5px;
  border-block-end-style: solid;
  z-index: 21;
}

grid-col-sizer-container.border {
  margin-inline-end: -0.5px;
  border-inline-end-style: solid;
  z-index: 21;
}

grid-row-sizer-container.border.collapsed {
  border-block-end-style: none;
}

grid-col-sizer-container.border.collapsed {
  border-inline-end-style: none;
}

grid-row-sizer,
grid-col-sizer {
  // pointer-events: none;
  // transition: background-color 0.125s linear;
}

.resizable grid-row-sizer {
  pointer-events: all;
  // cursor: row-resize;
  // z-index: 21;
}

.resizable grid-col-sizer {
  pointer-events: all;
  // cursor: col-resize;
  // z-index: 21;
}

grid-row-sizer:hover,
grid-row-sizer:active,
grid-col-sizer:hover,
grid-col-sizer:active {
  // background-color: rgba($color: black, $alpha: 0.35);
}

.collapsed grid-row-sizer:hover,
.collapsed grid-row-sizer:active,
.collapsed grid-col-sizer:hover,
.collapsed grid-col-sizer:active {
  // background-color: rgba($color: black, $alpha: 0.35);
}
</style>
