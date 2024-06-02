<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import { min, max, floor, ceil, seq } from '$lib'
import { mean, standardDeviation } from 'simple-statistics'
import CheckBox from '$lib/ui/components/CheckBox.svelte'
import type { IndexedUndefined } from '$lib/types'
import type { Collection } from '$lib/types'
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import { getPropNames } from '$lib'
import type { DragStartEvent } from '$lib/app/api/types'

onMount(async () => {
  elh = document.getElementById(`${uid}-table-height-container`) as HTMLElement
  elc = document.getElementById(`${uid}-table-container`) as HTMLElement

  elc.tabIndex = 0
  elc.onfocus = _onfocus
  elc.onkeydown = _onkeydown
  elc.onscroll = _onscroll

  await tick()

  const _ = getRowHeight()
  rowH = _.rowH
  rowHeight = rowH
  charW = _.chrW
  visH = elh.clientHeight

  addEventListener('resize', resizeEvtListener, { capture: true })
})

onDestroy(() => {
  removeEventListener('resize', resizeEvtListener, { capture: true })
})

const resizeEvtListener = (_: UIEvent) => {
  visH = elh.clientHeight
}

export let rl: RecordList<IndexedUndefined>
export let showHeaderRow: boolean = false
export let showFooterRow: boolean = false

export let multiRowSelect: boolean = false
export let showCheckBoxes: boolean = false

export let onDeleteRow: (id: unknown) => unknown = (id) => {
  console.log('onDeleteRow placeholder function:', uid, id)
}

if (!multiRowSelect && showCheckBoxes) {
  console.warn('multiRowSelect === false && showCheckBoxes === true')
  showCheckBoxes = false
}

export let minColW: number = 50
export let uid: string
export let activeRowKey: string | number | undefined = undefined
export let activeRowRecord: object | undefined = undefined
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

function processSelectedRowKeys(_selectedRowKeys: { [key: string]: boolean | null | undefined }) {
  const _ = getPropNames(_selectedRowKeys)
  const ids: string[] = []
  _.forEach((n) => {
    if (_selectedRowKeys[n] === true) ids.push(n)
  })
  return ids
}

export let selectedRecordIds: string[] = []
let _selectedRowKeys: { [key: string]: boolean | null | undefined } = {}
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
$: rows = seq(firstRow, lastRow)

$: selectedRecordIds = processSelectedRowKeys(_selectedRowKeys)

let rowHs: number[] = []
$: {
  for (let i = 0; i < nRow; i++) {
    rowHs.push(rowH)
  }
}

$: if (activeRow !== undefined) {
  activeRowKey = rl.stringValueByIndex(activeRow, rl.keyField)
  activeRowRecord = rl.items[activeRow]
}

function onDragStart(e: Event) {
  const ev = e as DragStartEvent
  const ark = activeRowKey as string
  ev.payload.type = 'acc-ver-array'

  const el = ev.payload.showWhileDraggingEl as HTMLElement
  el.style.borderStyle = 'solid'
  el.style.backgroundColor = 'yellow'

  if (selectedRecordIds.includes(ark)) {
    ev.payload.data = selectedRecordIds
    el.innerText = `${selectedRecordIds.length} records`
  } else {
    ev.payload.data = [ark]
    el.innerText = ark
  }
  // console.log('onDragStart:', ev.payload)
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
        _selectedRowKeys[activeRowKey] = !_selectedRowKeys[activeRowKey]
      }
      ev.preventDefault()
      break
    case 'Backspace':
      if (ev.metaKey === true) {
        onDeleteRow(activeRowKey)
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

function calcColWidths(rl: RecordList<IndexedUndefined | Collection>, charW: number) {
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
      const w = ceil(mean(values) + min(standardDeviation(values), minColW)) * charW
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

function getRowHeight(): { rowH: number; chrW: number } {
  const _table = document.createElement('div')
  const _row = document.createElement('div')
  const _cell = document.createElement('div')
  _table.className = 'table'
  _row.className = 'row-b'
  _cell.className = 'cell'
  _cell.textContent = '__13__ac__46__'
  _row.appendChild(_cell)
  _table.appendChild(_row)
  const _container = document.getElementById(`${uid}-table-container`) as HTMLElement
  _container.appendChild(_table)
  const rowH = _row.offsetHeight
  const chrW = floor(_cell.offsetWidth / _cell.textContent.length) + 0.5
  _cell.remove()
  _row.remove()
  _table.remove()
  return { rowH, chrW }
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
      rl = rl
    } else {
      // sortDirections.push(dir)
      sortDirections.unshift(dir)
      // sortFields.push(field)
      sortFields.unshift(field)
      rl.sortBy(sortFields as never[], sortDirections)
      rl = rl
    }
  }
}
</script>

<!-- toolbar BEG -->
<!-- <div class="toolbar">
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
</div> -->
<!-- toolbar END -->

<div id="{uid}-table-height-container" class="table-height-container">
  <!-- table-container BEG -->
  <div id="{uid}-table-container" class="table-container" style:height="{nRow * rowH}px">
    {#if rl.length === 0}
      <div style="margin: auto;">No records.</div>
    {:else if rl.fieldsToShow.length === 0}
      <div style="margin: auto;">No fields to display.</div>
    {:else if maxRowsVis == 0}
      <div style="margin: auto;">Not enough space to display the table.</div>
    {:else}
      <!-- table-scroll-container BEG -->
      {initColWs()}
      <div id="{uid}-table-scroll-container" class="table-scroll-container" style:height="{scrollH}px">
        <!-- table BEG -->
        <div id="{uid}-table" class="table">
          <ResizableGrid
            {uid}
            {rowHs}
            {colWs}
            {minColW}
            rowsResizable="{false}"
            colsResizable="{true}"
            {nRow}
            {nCol}
            fixedWCols="{showCheckBoxes ? [0] : []}"
            enforceMaxSize="{false}"
            minRowH="{rowH}">
            <!-- header BEG -->
            {#if showHeaderRow}
              <div id="{uid}-row-h" style:grid-row="{1}/{2}" style:grid-column="1/{nCol + 1}" class="row-h">
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

            {#each rows as i, k}
              <div
                id="{uid}-row-{i}"
                style:grid-row="{k + 1 + nH}/{k + 2 + nH}"
                style:grid-column="1/{nCol + 1}"
                class="
                row-b
                {_selectedRowKeys[rl.stringValueByIndex(i, rl.keyField)] ? 'selected-row' : ''}
                {activeRow === i ? 'active-row' : ''}
                draggable
              "
                role="none"
                on:mousedown="{() => {
                  activeRow = i
                }}"
                on:dragstart="{onDragStart}">
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
                      bind:checked="{_selectedRowKeys[rl.stringValueByIndex(i, rl.keyField)]}" />
                  </div>
                {/if}
                {#each rl.fieldsToShow as field, j}
                  <div id="{uid}-cell-{i}-{j}" class="cell">
                    {rl.valueByIndex(i, field, '', '-')}
                  </div>
                {/each}
              </div>
            {/each}
            <!-- footer BEG -->
            {#if showFooterRow}
              <div id="{uid}-row-f" class="row-f" style:grid-row="{nRow}/{nRow + 1}" style:grid-column="1/{nCol + 1}">
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
            <div class="col-tools-container" style:grid-row="1/{nRow + 1}" style:grid-column="1/{nCol + 1}">
              {#if showCheckBoxes}
                <div class="col-tools"></div>
              {/if}
              {#each rl.fieldsToShow as _, i}
                <div class="col-tools {sortDirections[sortFields.indexOf(_)] ? 'sorting' : ''}">
                  <sorter
                    id="{uid}-col-sorter-order-{i + Number(showCheckBoxes)}"
                    class="col-sorter-order {sortDirections[sortFields.indexOf(_)] ? 'sorting' : ''}"
                    role="none"
                    on:click="{() => {
                      sort(_, undefined)
                    }}">
                    {sortFields.indexOf(_) !== -1 ? sortFields.indexOf(_) + 1 : ''}
                  </sorter>
                  <sorter
                    id="{uid}-col-sorter-direction-{i + Number(showCheckBoxes)}"
                    class="col-sorter-direction {sortDirections[sortFields.indexOf(_)]
                      ? 'sorting'
                      : ''} {sortDirections[sortFields.indexOf(_)] === 1 ? 'inc' : ''} {sortDirections[
                      sortFields.indexOf(_)
                    ] === -1
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
}

.row-h,
.row-b,
.row-f {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: subgrid;
}

.row-b {
}

.row-h {
}

.row-f {
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
  margin-inline-end: 0.15em;
  margin-inline-start: auto;
  width: 2.5em;
  height: 1.4em;
  z-index: 30;
  align-items: center;
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
