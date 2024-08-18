<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte'
import type { IndexedUndefined, Collection } from '$lib/types'
import { RecordList } from '$lib/models/record-list'
import { getPropNames, makeNumericSeq } from '$lib/utils'
import { mean, standardDeviation } from 'simple-statistics'
import { ResizableGrid } from '$lib/ui/resizable-grid'
import { CheckBox } from '$lib/ui/form-elements'
import { getRowHeight } from '.'
import { clipboardWrite } from '$lib/backend/clipboard'
import { gSysInfo } from '$lib/backend/system-info'
import type { DragStartEvent } from '$lib/backend'

const min = Math.min
const max = Math.max
const floor = Math.floor
const ceil = Math.ceil

onMount(async () => {
  elh = document.getElementById(`${uid}-table-height-container`) as HTMLElement
  elc = document.getElementById(`${uid}-table-container`) as HTMLElement

  elc.tabIndex = 0
  elc.onfocus = _onfocus
  elc.onkeydown = _onkeydown
  elc.onkeyup = _onkeyup
  elc.onscroll = _onscroll
  elc.onmousedown = _onmousedown

  await tick()

  const _ = getRowHeight(uid)
  rowH = _.rowH
  rowHeight = rowH
  charW = _.chrW
  visH = elh.clientHeight

  addEventListener('resize', resizeEvtListener, {
    capture: false,
    passive: true
  })
  addEventListener(rl.updatedEventName, rlUpdatedListener)
  addEventListener('contextmenu', rightClickListener, true)
})

onDestroy(() => {
  removeEventListener('resize', resizeEvtListener, false)
  removeEventListener(rl.updatedEventName, rlUpdatedListener)
  removeEventListener('contextmenu', rightClickListener, true)
})

const rightClickListener = () => {
  if (activeRowKey !== undefined) {
    clipboardWrite(activeRowKey)
  }
}

const rlUpdatedListener = async () => {
  rl = rl
  _selectedRowKeys = _selectedRowKeys
}

const resizeEvtListener = (_: UIEvent) => {
  visH = elh.clientHeight
}

export let rl: RecordList<IndexedUndefined>
export let showHeaderRow: boolean = false
export let showFooterRow: boolean = false

export let multiRowSelect: boolean = false
export let showCheckBoxes: boolean = false

export let draggable: boolean = false

export let onDeleteRows: (ids: string[]) => unknown = (id) => {
  console.warn('onDeleteRows placeholder function:', uid, id)
}

if (!multiRowSelect && showCheckBoxes) {
  console.warn('multiRowSelect === false && showCheckBoxes === true')
  showCheckBoxes = false
}

export let minColW: number = 25
export let uid: string
export let activeRowKey: string | undefined = undefined
export let rowHeight: number | undefined = undefined

$: nH = showHeaderRow ? 1 : 0
$: nF = showFooterRow ? 1 : 0

let charW: number
let rowH: number
let visH: number
let elh: HTMLElement
let elc: HTMLElement
let colWs: number[] = []
let maxRowsVis: number
let rows: number[] = []

let scrollTop: number = 0
let firstRowRequested: number
let firstRow: number
let lastRow: number

let shiftSelectionRow: number | undefined = undefined

function processSelectedRowKeys(_selectedRowKeys: {
  [key: string]: boolean | null | undefined
}) {
  const _ = getPropNames(_selectedRowKeys)
  const ids: string[] = []
  _.forEach((k) => {
    const v = _selectedRowKeys[k]
    if (rl.allKeys.includes(k) && v === true) ids.push(k)
  })
  return ids
}

export let selectedRowKeys: string[] = []

let _selectedRowKeys: {
  [key: string]: boolean | null | undefined
} = {}

if (selectedRowKeys.length > 0) {
  selectedRowKeys.forEach((k) => (_selectedRowKeys[k] = true))
}

let activeRow: number = 0

$: nRow = maxRowsVis + nH + nF
$: nCol = rl.fieldsToShow.length + Number(showCheckBoxes)

$: sortFields = rl.sortFields
$: sortDirections = rl.sortDirections

$: scrollH = rowH * rl.length + rowH * (nH + nF)
$: maxRowsVis = rowH > 0 ? max(floor(visH / rowH) - (nH + nF), 0) : 0
$: firstRowRequested = rowH > 0 ? ceil(scrollTop / rowH) : 0
$: lastRow = max(0, min(firstRowRequested + (maxRowsVis - 1), rl.length - 1))
$: firstRow = lastRow > 0 ? max(0, lastRow - (maxRowsVis - 1)) : 0
$: rows = makeNumericSeq(firstRow, lastRow)

$: selectedRowKeys = processSelectedRowKeys(_selectedRowKeys)

let rowHs: number[] = []
$: {
  rowHs = []
  for (let i = 0; i < nRow; i++) {
    rowHs.push(rowH)
  }
}

function updateActiveRow(rl: RecordList<IndexedUndefined>) {
  const _prevActiveRowKey = activeRowKey
  if (_prevActiveRowKey) {
    const _activeRow = rl.indexByKey(_prevActiveRowKey as string)
    if (_activeRow !== undefined) {
      activeRow = _activeRow
    } else {
      activeRow = 0
    }
    scrollActiveRowIntoView()
  }
}

$: updateActiveRow(rl)
$: activeRowKey = rl.stringValueByIndex(activeRow)

function onDragStart(e: Event) {
  const ev = e as DragStartEvent
  const ark = activeRowKey as string
  ev.payload.type = 'acc-ver-array'
  const el = ev.payload.showWhileDraggingEl as HTMLElement
  el.style.borderStyle = 'solid'
  el.style.backgroundColor = 'yellow'
  if (selectedRowKeys.includes(ark) && selectedRowKeys.length > 1) {
    ev.payload.data = selectedRowKeys
    el.innerText = `${selectedRowKeys.length} records`
  } else {
    ev.payload.data = [ark]
    el.innerText = ark
  }
}

const _onscroll = (_: Event) => {
  scrollTop = elc.scrollTop
}

const _onfocus = (ev: FocusEvent) => {
  ev.stopPropagation()
  ev.stopImmediatePropagation()
}

function scrollActiveRowIntoView() {
  if (elc === undefined) return
  if (activeRow < firstRow - 1 || activeRow > lastRow + 1) {
    elc.scrollTo({
      top: max(activeRow - floor(maxRowsVis / 2), 0) * rowH,
      behavior: 'smooth'
    })
  }
}

const _onkeydown = (ev: KeyboardEvent) => {
  const allowed = ['Tab']
  if (
    !(
      allowed.includes(ev.code) ||
      (ev.metaKey && (ev.code === 'KeyQ' || ev.code === 'KeyW'))
    )
  ) {
    ev.preventDefault()
  }

  if (ev.shiftKey) {
    if (multiRowSelect && activeRowKey !== undefined) {
      shiftSelectionRow = activeRow
    } else {
      shiftSelectionRow = undefined
    }
  }

  switch (ev.code) {
    case 'ArrowDown':
      activeRow = min(activeRow + 1, rl.length - 1)
      if (lastRow < activeRow) {
        elc.scrollTo({
          top: (activeRow - lastRow + firstRow) * rowH
        })
      }
      break
    case 'ArrowUp':
      activeRow = max(activeRow - 1, 0)
      if (firstRow > activeRow) {
        elc.scrollTo({
          top: activeRow * rowH
        })
      }
      break
    case 'Space':
      if (multiRowSelect && activeRowKey !== undefined) {
        _selectedRowKeys[activeRowKey] = !_selectedRowKeys[activeRowKey]
      }
      break
    case 'KeyA':
      if (multiRowSelect && activeRowKey !== undefined) {
        for (let i = 0; i < rl.keys.length; i++) {
          const k = rl.keys[i]
          _selectedRowKeys[k] = true
        }
      }
      break
    case 'Backspace':
      if (ev.metaKey === true) {
        const _idsSel = new Set([...selectedRowKeys])
        const _idsCurr = new Set([...rl.keys])
        const _idsToRemove = [..._idsSel.intersection(_idsCurr)]

        if (_idsToRemove.length > 0) {
          onDeleteRows(_idsToRemove)
          if (
            activeRowKey !== undefined &&
            _idsToRemove.includes(activeRowKey)
          ) {
            activeRow = max(0, min(activeRow + 1, rl.length - 2))
          }
        } else if (activeRowKey !== undefined) {
          onDeleteRows([activeRowKey])
          activeRow = max(0, min(activeRow + 1, rl.length - 2))
        }
      }
      break
    default:
      break
  }
  if (!ev.shiftKey) {
    scrollActiveRowIntoView()
  }
}

const _onkeyup = (ev: KeyboardEvent) => {
  if (multiRowSelect) {
    shiftSelectionRow = undefined
  }
}

const _onmousedown = (ev: MouseEvent) => {
  if (shiftSelectionRow !== undefined) {
    const n = shiftSelectionRow - activeRow
    if (multiRowSelect && activeRowKey !== undefined) {
      for (let i = 0; i < Math.abs(n) + 1; i++) {
        const rk = rl.stringValueByIndex(
          shiftSelectionRow + i * Math.sign(n) * -1
        )
        _selectedRowKeys[rk] = !_selectedRowKeys[rk]
      }
      shiftSelectionRow = activeRow
    }
  }
}

let allChecked: boolean = false
// $: allChecked = _allChecked(selectedRowKeys)
// function _allChecked(selectedRowKeys: string[]) {
//   for (let i = 0; i < rl.allKeys.length; i++) {
//     const k = rl.allKeys[i] as string;
//     if (k in _selectedRowKeys && _selectedRowKeys[k] === true) {
//       return true
//     }
//   }
//   return false
// }

function selectAll() {
  rl.keys.forEach((k) => {
    k = k as string
    _selectedRowKeys[k] = !allChecked
  })
}

function calcColWidths(
  rl: RecordList<IndexedUndefined | Collection>,
  charW: number
) {
  const colWs: number[] = []
  if (showCheckBoxes) {
    colWs.push(charW * 2.35)
  }
  for (let i = 0; i < rl.fieldsToShow.length; i++) {
    const field = rl.fieldsToShow[i]
    const values: number[] = []
    for (let j = 0; j < rl.length; j++) {
      const value = rl.valueByIndex(j, field, '')
      values.push(formatValue(value, field).length)
    }
    if (values.length > 0) {
      const w =
        ceil(mean(values) + min(standardDeviation(values), minColW)) * charW
      colWs.push(max(max(minColW, w), max(...values) * charW * 0.95) + 15)
    }
  }

  // Set last column to auto-size
  return [...colWs.slice(0, -1), -1]
}

function initColWs() {
  colWs = calcColWidths(rl, charW)
  return ''
}

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
    } else {
      sortDirections.unshift(dir)
      sortFields.unshift(field)
      rl.sortBy(sortFields as never[], sortDirections)
    }
  }
}

function formatValue(
  val: string | number | boolean | object | null | undefined,
  field: string
) {
  let rv: string = ''
  if (typeof val === 'number') {
    // Dirty way to avoid formatting tax_ids as numbers
    if (field.endsWith('id') || field.endsWith('Id')) {
      rv = val.toString()
    } else {
      rv = val.toLocaleString(gSysInfo.locale)
    }
  } else if (typeof val === 'boolean') {
    rv = val ? 'YES' : 'NO'
  } else if (typeof val === 'object') {
    rv = 'OBJECT'
  } else if (val === undefined) {
    rv = 'UNDEFINED'
  } else if (val === null) {
    rv = 'NULL'
  } else {
    rv = val
  }
  return rv
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

<div
  id="{uid}-table-height-container"
  class="table-height-container">
  <!-- table-container BEG -->
  <div
    id="{uid}-table-container"
    class="table-container"
    style:height="{nRow * rowH}px">
    {#if rl.length === 0}
      <div style="margin: auto;">No records.</div>
    {:else if rl.fieldsToShow.length === 0}
      <div style="margin: auto;">No fields to display.</div>
    {:else if maxRowsVis == 0}
      <div style="margin: auto;">Not enough space to display the table.</div>
    {:else}
      <!-- table-scroll-container BEG -->
      {initColWs()}
      <div
        id="{uid}-table-scroll-container"
        class="table-scroll-container"
        style:height="{scrollH}px">
        <!-- table BEG -->
        <div
          id="{uid}-table"
          class="table">
          <ResizableGrid
            uid="grid-{uid}"
            {rowHs}
            {colWs}
            {minColW}
            rowsResizable="{false}"
            colsResizable="{true}"
            fixedWCols="{showCheckBoxes ? [0] : []}"
            minRowH="{rowH}">
            <!-- header BEG -->
            {#if showHeaderRow}
              <div
                id="{uid}-row-h"
                style:grid-row="{1}/{2}"
                style:grid-column="1/{nCol + 1}"
                class="row-h">
                {#if showCheckBoxes}
                  <!-- <div class="cell-corner"></div> -->
                  <div class="cell checkbox">
                    <CheckBox
                      id="{uid}-checkbox-h"
                      tabindex="{-1}"
                      on:mousedown="{(e) => {
                        elc.focus()
                        e.preventDefault()
                        selectAll()
                      }}"
                      bind:checked="{allChecked}"></CheckBox>
                  </div>
                {/if}
                {#each rl.fieldsToShow as field}
                  <div class="cell">
                    {field}
                  </div>
                {/each}
              </div>
            {/if}
            <!-- header END -->

            {#each rows as i, k}
              <div
                id="{uid}-row-{i}"
                style:grid-row="{k + 1 + nH}/{k + 2 + nH}"
                style:grid-column="1/{nCol + 1}"
                class="
                  row-b
                  {_selectedRowKeys[rl.stringValueByIndex(i, rl.keyField)]
                  ? 'selected-row'
                  : ''}
                  {activeRow === i ? 'active-row' : ''}
                  {draggable ? 'draggable' : ''}
                "
                role="none"
                on:mousedown="{() => {
                  activeRow = i
                }}"
                on:dragstart="{onDragStart}">
                {#if showCheckBoxes}
                  <div
                    id="{uid}-cell-{i}-checkbox"
                    class="cell checkbox">
                    <CheckBox
                      id="{uid}-checkbox-{i}"
                      tabindex="{-1}"
                      on:mousedown="{(e) => {
                        elc.focus()
                        e.preventDefault()
                      }}"
                      bind:checked="{_selectedRowKeys[
                        rl.stringValueByIndex(i, rl.keyField)
                      ]}" />
                  </div>
                {/if}
                {#each rl.fieldsToShow as field, j}
                  <div
                    id="{uid}-cell-{i}-{j}"
                    class="cell{rl.typeByIndex(i, field)
                      ? ' numeric'
                      : ''}{colWs[j + 1] === 0 ? ' collapsed' : ''}">
                    {formatValue(rl.valueByIndex(i, field, '', '-'), field)}
                  </div>
                {/each}
              </div>
            {/each}
            <!-- footer BEG -->
            {#if showFooterRow}
              <div
                id="{uid}-row-f"
                class="row-f"
                style:grid-row="{nRow}/{nRow + 1}"
                style:grid-column="1/{nCol + 1}">
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
            <!-- col-tools-container BEG -->
            <div
              class="col-tools-container"
              style:grid-row="1/{nRow + 1}"
              style:grid-column="1/{nCol + 1}">
              {#if showCheckBoxes}
                <div class="col-tools hidden"></div>
              {/if}
              {#each rl.fieldsToShow as _, i}
                <div
                  class="col-tools {sortDirections[sortFields.indexOf(_)]
                    ? 'sorting'
                    : ''}">
                  <sorter
                    id="{uid}-col-sorter-order-{i + Number(showCheckBoxes)}"
                    class="col-sorter-order {sortDirections[
                      sortFields.indexOf(_)
                    ]
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
                </div>
              {/each}
            </div>
            <!-- col-tools-container END -->
          </ResizableGrid>
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
  flex-grow: 1;
  flex-shrink: 1;
  height: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 0;
  max-height: 100%;
}

.table-container {
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
}

.row-h,
.row-b,
.row-f {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: subgrid;
}

.cell {
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

.col-tools-container {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: subgrid;
}

.col-tools {
  position: relative;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  font-size: 0.75rem;
  margin-block: auto;
  margin-inline-end: 0.2em;
  margin-inline-start: auto;
  width: 2.5em;
  height: 1.4em;
  z-index: 30;
  align-items: center;
}

.col-tools.hidden {
  pointer-events: none;
}

.col-sorter-direction {
  width: 1.25em;
  height: 100%;
  text-align: center;
  align-content: center;
  z-index: 31;
}

.col-sorter-order {
  flex-grow: 1;
  width: 1.25em;
  height: 100%;
  text-align: right;
  align-content: center;
  z-index: 32;
}

.sorting.inc::after {
  content: '▲';
}

.sorting.dec::after {
  content: '▼';
}
</style>
