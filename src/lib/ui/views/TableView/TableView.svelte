<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import { min, max, floor, ceil, seq } from '$lib'
import { mean, standardDeviation } from 'simple-statistics'
import CheckBox from '$lib/ui/components/CheckBox.svelte'

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

export let onDeleteRow: (id: string | number | undefined) => any = (id) => {
  console.log('onDeleteRow placeholder function:', uid, id)
}

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

$: sortFields = rl.sortFields
$: sortDirections = rl.sortDirections

$: scrollH = rowH * rl.length + rowH * (nH + nF)
$: maxRowsVis = rowH > 0 ? floor(visH / rowH - 0.25) - (nH + nF) : 0
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
      ev.preventDefault()
      break
    case 'ArrowUp':
      activeRow = max(activeRow - 1, 0)
      if (firstRow > activeRow) {
        elc.scrollTo({ top: activeRow * rowH })
      }
      ev.preventDefault()
      break
    case 'Space':
      if (multiRowSelect && activeRowKey !== undefined) {
        selectedRows[activeRowKey] = !selectedRows[activeRowKey]
      }
      ev.preventDefault()
      break
    case 'Backspace':
      if (ev.metaKey === true) {
        onDeleteRow(activeRowKey)
      }
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

// function getActiveRowElement(activeRow: number) {
//   return document.getElementById(`${uid}-row-${activeRow}`) ?? undefined
// }

function sort(field: string | undefined, direction: boolean | undefined) {
  let idx: number = -1
  let dir: -1 | 1 = 1
  if (field !== undefined) {
    idx = sortFields.indexOf(field)
    if (idx !== -1) {
      dir = sortDirections[idx]
      if (direction !== undefined) {
        sortDirections[idx] = -dir as -1 | 1
      } else {
        if (idx > 0) {
          sortFields = [
            ...sortFields.slice(0, idx - 1),
            sortFields[idx],
            sortFields[idx - 1],
            ...sortFields.slice(idx + 1)
          ]

          sortDirections = [
            ...sortDirections.slice(0, idx - 1),
            sortDirections[idx],
            sortDirections[idx - 1],
            ...sortDirections.slice(idx + 1)
          ]
        } else if (idx === 0) {
          sortDirections.shift()
          sortFields.shift()
        }
      }
      rl.sortBy(sortFields as never[], sortDirections)
      rl = rl
    } else {
      sortDirections.push(dir)
      sortFields.push(field)
      rl.sortBy(sortFields as never[], sortDirections)
      rl = rl
    }
  }
}
</script>

<!-- toolbar BEG -->
<!--
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
-->
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
          <!-- {#key rl.sortFields[0]} -->
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
                  <CheckBox
                    id="{uid}-checkbox-{i}"
                    tabindex="{-1}"
                    margin="{false}"
                    on:mousedown="{(e) => {
                      elc.focus()
                      e.preventDefault()
                    }}"
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
          <!-- {/key} -->

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
              <div class="col-tools">
                <sorter
                  id="{uid}-col-sorter-order-{i + Number(showCheckBoxes)}"
                  class="col-sorter-order {sortDirections[sortFields.indexOf(_)]
                    ? 'sorting'
                    : ''}"
                  role="none"
                  on:click="{() => {
                    sort(_, undefined)
                  }}">
                  {sortFields.indexOf(_) !== -1
                    ? sortFields.indexOf(_) + 1
                    : ''}
                </sorter>
                <sorter
                  id="{uid}-col-sorter-direction-{i + Number(showCheckBoxes)}"
                  class="col-sorter-direction {sortDirections[
                    sortFields.indexOf(_)
                  ]
                    ? 'sorting'
                    : ''} {sortDirections[sortFields.indexOf(_)] === 1
                    ? 'inc'
                    : ''} {sortDirections[sortFields.indexOf(_)] === -1
                    ? 'dec'
                    : ''}"
                  role="none"
                  on:click="{() => {
                    sort(_, true)
                  }}">
                </sorter>
                <resizer
                  id="{uid}-col-sizer-{i + Number(showCheckBoxes)}"
                  class="col-sizer"
                  role="none"
                  on:mousedown="{resizeColBegin}">
                </resizer>
              </div>
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
  flex-grow: 1;
  flex-shrink: 1;
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
  z-index: 1;
}

.row-f {
  position: sticky;
  bottom: 0;
  z-index: 1;
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

.col-tools {
  position: relative;
  top: 0;
  left: 0;
  cursor: pointer;
  pointer-events: none;
  font-size: calc(var(--fs) - 2px);
}

.col-sizer {
  position: absolute;
  left: calc(100% - 12px);
  width: 12px;
  height: 100%;
  cursor: col-resize;
  pointer-events: fill;
  z-index: 0;
}

.col-sorter-order {
  position: absolute;
  right: 13px;
  top: 2px;
  width: 14px;
  height: 13px;
  cursor: pointer;
  pointer-events: fill;
  z-index: 1;
  text-align: right;
  padding-inline-end: 2px;
}

.col-sorter-direction {
  position: absolute;
  right: 3px;
  top: 2px;
  width: 10px;
  height: 13px;
  cursor: pointer;
  pointer-events: fill;
  z-index: 2;
  text-align: center;
}

.sorting {
  align-content: center;
  // align-items: left;
  padding-right: 4px;
  // background-color: red;
}

.sorting.inc::after {
  content: '';
  display: block;
  margin: auto;
  position: relative;
  top: 0.125rem;
  width: 0.5rem;
  height: 0.5rem;
  border-width: 0.2rem 0 0 0.2rem;
  border-style: solid;
  transform: rotate(45deg);
}

.sorting.dec::after {
  content: '';
  display: block;
  margin: auto;
  position: relative;
  bottom: 0.05rem;
  width: 0.5rem;
  height: 0.5rem;
  border-width: 0 0.2rem 0.2rem 0;
  border-style: solid;
  transform: rotate(45deg);
}
</style>
