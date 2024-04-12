<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import { min, max, floor, ceil, seq } from '$lib'
import { mean, standardDeviation } from 'simple-statistics'

onMount(() => {
  elh = document.getElementById(`${uid}-table-height-container`) as HTMLElement
  elc = document.getElementById(`${uid}-table-container`) as HTMLElement

  elc.tabIndex = 0
  elc.onfocus = _onfocus
  elc.onkeydown = _onkeydown
  elc.onscroll = _onscroll

  const _ = getRowHeight()
  rowH = _.rowH
  charW = _.chrW
  visH = elh.clientHeight

  addEventListener('resize', resizeEvtListener, { capture: true })
  addEventListener('mousemove', resizeCol, { capture: true })
  addEventListener('mouseup', resizeColEnd, { capture: true })
  // addEventListener('keydown', keyboardEventListener, { capture: true })
})

onDestroy(() => {
  removeEventListener('resize', resizeEvtListener, { capture: true })
  removeEventListener('mousemove', resizeCol, { capture: true })
  removeEventListener('mouseup', resizeColEnd, { capture: true })
  // removeEventListener('keydown', keyboardEventListener, { capture: true })
})

// const keyboardEventListener = (ev: KeyboardEvent) => {
//   const allowed = ['Tab']
//   if (!allowed.includes(ev.code)) ev.preventDefault()
// }

const resizeEvtListener = (_: UIEvent) => {
  visH = elh.clientHeight
}

export let rl: RecordList<any>
export let showHeaderRow: boolean = false
export let showFooterRow: boolean = false

export let multiRowSelect: boolean = false
export let showCheckBoxes: boolean = false

if (!multiRowSelect && showCheckBoxes) {
  console.warn('multiRowSelect === false && showCheckBoxes === true')
  showCheckBoxes = false
}

export let minColW: number = 50
export let uid: string
export let activeRowKey: string | number | undefined = undefined
export let activeRowRecord: any | undefined = undefined

$: nH = showHeaderRow ? 1 : 0
$: nF = showFooterRow ? 1 : 0

let charW: number
let rowH: number
let visH: number
let elh: HTMLElement
let elc: HTMLElement
let colWs: number[] = []
let colWsStr: string
let maxRowsVis: number
let rows: number[] = []

let scrollTop: number = 0
let firstRowRequested: number
let firstRow: number
let lastRow: number

let selectedRows: { [key: string]: boolean | null | undefined } = {}
let activeRow: number = 0

$: scrollH = rowH * rl.length + rowH * (nH + nF)
$: maxRowsVis = rowH > 0 ? floor(visH / rowH) - (nH + nF) : 0
$: firstRowRequested = rowH > 0 ? ceil(scrollTop / rowH) : 0
$: lastRow = max(0, min(firstRowRequested + (maxRowsVis - 1), rl.length - 1))
$: firstRow = lastRow > 0 ? max(0, lastRow - (maxRowsVis - 1)) : 0
$: rows = seq(firstRow, lastRow)

$: colWs = calcColWidths(rl, charW)
$: colWsStr = colWStrFromColWs(colWs)

$: if (activeRow !== undefined) {
  activeRowKey = rl.stringValueByIndex(activeRow, rl.keyField)
  activeRowRecord = rl.items[activeRow]
}

const _onscroll = (_: Event) => {
  scrollTop = elc.scrollTop
}

const _onfocus = (ev: FocusEvent) => {
  if (activeRow === undefined) activeRow = firstRow
  ev.stopPropagation()
  ev.stopImmediatePropagation()
}

const _onkeydown = (ev: KeyboardEvent) => {
  const allowed = ['Tab']
  if (!allowed.includes(ev.code)) ev.preventDefault()

  switch (ev.code) {
    case 'ArrowDown':
      activeRow = min(activeRow + 1, rl.length - 1)
      if (lastRow < activeRow) {
        elc.scrollTo({ top: (activeRow - lastRow + firstRow) * rowH })
      }
      break
    case 'ArrowUp':
      activeRow = max(activeRow - 1, 0)
      if (firstRow > activeRow) {
        elc.scrollTo({ top: activeRow * rowH })
      }
      break
    case 'Space':
      if (multiRowSelect && activeRowKey !== undefined) {
        selectedRows[activeRowKey] = !selectedRows[activeRowKey]
      }
      break
    default:
      break
  }

  if (activeRow < firstRow - 1 || activeRow > lastRow + 1) {
    elc.scrollTo({
      top: max(activeRow - floor(maxRowsVis / 2), 0) * rowH,
      behavior: 'smooth'
    })
  }
}

function calcColWidths(rl: RecordList<any>, charW: number) {
  const colWs: number[] = []
  if (showCheckBoxes) {
    colWs.push(charW * 3)
  }
  for (let i = 0; i < rl.fieldsToShow.length; i++) {
    const field = rl.fieldsToShow[i]
    const values: number[] = []
    for (let j = 0; j < rl.length; j++) {
      const value = rl.valueByIndex(j, field, '')
      values.push(String(value).length)
    }
    if (values.length > 0) {
      const w = ceil(mean(values) + 2 * standardDeviation(values)) * charW
      colWs.push(max(95, min(300, w)))
    }
  }
  return colWs
}

function colWStrFromColWs(colWs: number[]): string {
  let _ = ''
  colWs.forEach((w) => {
    _ += ` ${w}px`
  })
  return _.trim()
}

function getColWidths(): number[] {
  const n = rl.fieldsToShow.length
  const colWs: number[] = []
  let j = 0
  if (showCheckBoxes) {
    const el = document.getElementById(
      `${uid}-cell-${firstRowRequested}-checkbox`
    )
    if (el) colWs[0] = el.offsetWidth
    j = 1
  }
  for (let i = 0; i < n; i++) {
    const el = document.getElementById(`${uid}-cell-${firstRowRequested}-${i}`)
    if (el) colWs[i + j] = el.offsetWidth
  }
  return colWs
}

function getRowHeight(): { rowH: number; chrW: number } {
  const _table = document.createElement('div')
  const _row = document.createElement('div')
  const _cell = document.createElement('div')
  _table.className = 'table'
  _row.className = 'row-b'
  _cell.className = 'cell'
  _cell.textContent = '_1-2_3-4_5-6_7-'
  _row.appendChild(_cell)
  _table.appendChild(_row)
  const _container = document.getElementById(
    `${uid}-table-container`
  ) as HTMLElement
  _container.appendChild(_table)
  const rowH = _row.offsetHeight
  const chrW = ceil(_cell.offsetWidth / _cell.textContent.length)
  _cell.remove()
  _row.remove()
  _table.remove()
  return { rowH, chrW }
}

// -----------------------------------------------------------------------------
let colResizing: number | null = null
let colPrevX: number | null = null
let colPrevWidth: number | null = null

function resizeColBegin(evt: MouseEvent) {
  document.body.style.cursor = 'col-resize'
  colWs = getColWidths()
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
// -----------------------------------------------------------------------------

function getActiveRowElement(activeRow: number) {
  return document.getElementById(`${uid}-row-${activeRow}`) ?? undefined
}
</script>

<!-- toolbar BEG -->
<div class="toolbar">
  <button
    class="toolbar-button"
    disabled="{firstRow <= 0}"
    on:click="{() => {
      elc.scrollBy({
        top: rowH * maxRowsVis * -1,
        behavior: 'instant'
      })
    }}">U</button>
  <button
    class="toolbar-button"
    disabled="{lastRow >= rl.length - 1}"
    on:click="{() => {
      elc.scrollBy({
        top: rowH * maxRowsVis,
        behavior: 'instant'
      })
    }}">D</button>
</div>
<!-- toolbar END -->

<div id="{uid}-table-height-container" class="table-height-container">
  <!-- table-container BEG -->
  <div
    id="{uid}-table-container"
    class="table-container"
    style:height="{nH * 3 + nF * 3 + (maxRowsVis + nH + nF) * rowH}px">
    {#if rl.length === 0}
      <pre>No records.</pre>
    {:else if rl.fieldsToShow.length === 0}
      <pre>No fields to display.</pre>
    {:else}
      <!-- table-scroll-container BEG -->
      <div
        id="{uid}-table-scroll-container"
        class="table-scroll-container"
        style:height="{scrollH}px">
        <!-- table BEG -->
        <div id="{uid}-table" class="table">
          <!-- header BEG -->
          {#if showHeaderRow}
            <div
              id="{uid}-row-h"
              class="row-h"
              style:grid-template-columns="{colWsStr}">
              {#if showCheckBoxes}
                <div class="cell-corner"></div>
              {/if}
              {#each rl.fieldsToShow as field}
                <div class="cell">
                  {field}
                </div>
              {/each}
            </div>
          {/if}
          <!-- header END -->

          {#each rows as i}
            <div
              id="{uid}-row-{i}"
              class="
                row-b
                {selectedRows[rl.stringValueByIndex(i, rl.keyField)]
                ? 'selected-row'
                : ''}
                {activeRow === i ? 'active-row' : ''}
              "
              role="none"
              on:mousedown="{() => {
                activeRow = i
              }}"
              style:grid-template-columns="{colWsStr}">
              {#if showCheckBoxes}
                <div id="{uid}-cell-{i}-checkbox" class="cell">
                  <input
                    type="checkbox"
                    id="{uid}-checkbox-{i}"
                    tabindex="-1"
                    on:click="{() => elc.focus()}"
                    on:contextmenu="{() => elc.focus()}"
                    bind:checked="{selectedRows[
                      rl.stringValueByIndex(i, rl.keyField)
                    ]}" />
                </div>
              {/if}
              {#each rl.fieldsToShow as field, j}
                <div id="{uid}-cell-{i}-{j}" class="cell">
                  {rl.valueByIndex(i, field, '')}
                </div>
              {/each}
            </div>
          {/each}

          <!-- footer BEG -->
          {#if showFooterRow}
            <div
              id="{uid}-row-f"
              class="row-f"
              style:grid-template-columns="{colWsStr}">
              {#if showCheckBoxes}
                <div class="cell-corner"></div>
              {/if}
              {#each rl.fieldsToShow as field}
                <div class="cell">
                  {field}
                </div>
              {/each}
            </div>
          {/if}
          <!-- footer END -->

          <!-- col-sizers BEG -->
          <div
            id="{uid}-col-sizers"
            class="col-sizers"
            style:grid-template-columns="{colWsStr}">
            {#if showCheckBoxes}
              <resizer id="{uid}-col-sizer-checkbox"></resizer>
            {/if}
            {#each rl.fieldsToShow as _, i}
              <resizer
                id="{uid}-col-sizer-{i + Number(showCheckBoxes)}"
                class="col-sizer"
                role="none"
                on:mousedown="{resizeColBegin}">
              </resizer>
            {/each}
          </div>
          <!-- col-sizers END -->
        </div>
        <!-- table END -->
      </div>
      <!-- table-scroll-container END -->
    {/if}
  </div>
  <!-- table-container END -->
</div>

<style lang="scss">
.table-height-container {
  min-height: 0;
  max-height: 100%;
  min-width: 0;
  max-width: 100%;
  height: 100%;
}

.table-container {
  overflow-x: scroll;
  overflow-y: scroll;
  display: flex;
  flex-direction: row;
}

.table-scroll-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
}

.table {
  flex-grow: 0;
  flex-shrink: 1;
  position: sticky;
  top: 0;
  display: grid;
}

.row-h,
.row-b,
.row-f {
  display: grid;
}

.row-h {
  position: sticky;
  top: 0;
}

.row-f {
  position: sticky;
  bottom: 0;
}

.cell {
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

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
  cursor: col-resize;
  pointer-events: fill;
}
</style>
