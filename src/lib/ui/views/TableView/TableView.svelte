<script lang="ts">
import { onMount } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import { min, max, floor, ceil, seq, round } from '$lib'
import { mean, standardDeviation } from 'simple-statistics'

onMount(() => {
  elh = document.getElementById(`${uid}-table-height-container`) as HTMLElement
  elc = document.getElementById(`${uid}-table-container`) as HTMLElement
  // colWsStr = colWStrDefault()
  const _ = getRowHeight()
  rowH = _.rowH
  charW = _.chrW
  visH = elh.clientHeight
})

function calColWidths(rl: RecordList<any>, charW: number) {
  const colWs: number[] = []
  for (let i = 0; i < rl.fieldsToShow.length; i++) {
    const field = rl.fieldsToShow[i]
    const values: number[] = []
    for (let j = 0; j < rl.length; j++) {
      const value = rl.valueByIndex(j, field, '')
      values.push(String(value).length)
    }
    if (values.length > 0) {
      const w = ceil(mean(values) + 2 * standardDeviation(values)) * charW
      colWs.push(max(95, min(400, w)))
    }
  }
  return colWs
}

export let rl: RecordList<any>
export let showHeaderRow: boolean = true
export let showFooterRow: boolean = false
export let minColW: number = 40
export let uid: string

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

$: scrollH = rowH * rl.length + rowH * (nH + nF)
$: maxRowsVis = rowH > 0 ? floor(visH / rowH) - (nH + nF) - 0 : 0
$: firstRowRequested = rowH > 0 ? ceil(scrollTop / rowH) : 0
$: lastRow = max(0, min(firstRowRequested + (maxRowsVis - 1), rl.length - 1))
$: firstRow = lastRow > 0 ? max(0, lastRow - (maxRowsVis - 1)) : 0
$: rows = seq(firstRow, lastRow)

$: colWs = calColWidths(rl, charW)
$: colWsStr = colWStrFromColWs(colWs)

addEventListener('resize', (_: UIEvent) => {
  visH = elh.clientHeight
})

const onscroll = (_: Event) => {
  scrollTop = elc.scrollTop
}

function colWStrDefault(): string {
  let _ = ''
  for (let i = 0; i < rl.fieldsToShow.length; i++) {
    _ += ` 1fr`
  }
  return _.trim()
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
  for (let i = 0; i < n; i++) {
    const el = document.getElementById(
      `${uid}-cell-td-${firstRowRequested}-${i}`
    )
    if (el) colWs[i] = el.offsetWidth
  }
  return colWs
}

function getRowHeight(): { rowH: number; chrW: number } {
  const _table = document.createElement('div')
  const _row = document.createElement('div')
  const _cell = document.createElement('div')
  _table.className = 'table'
  _row.className = 'row-td'
  _cell.className = 'cell td'
  _cell.textContent = '_1-2_3-4_5-6_7-'
  _row.appendChild(_cell)
  _table.appendChild(_row)
  const _container = document.getElementById(
    `${uid}-table-container`
  ) as HTMLElement
  _container.appendChild(_table)
  const rowH = _cell.offsetHeight
  const chrW = ceil(_cell.offsetWidth / _cell.textContent.length)
  _cell.remove()
  _row.remove()
  _table.remove()
  return { rowH, chrW }
}

// -----------------------------------------------------------------------------

addEventListener('mousemove', (evt: MouseEvent) => {
  resizeCol(evt)
})

addEventListener('mouseup', (evt: MouseEvent) => {
  resizeColEnd(evt)
})

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
    // console.log(colWs)
    colResizing = null
    colPrevX = null
    colPrevWidth = null
    document.body.style.cursor = 'default'
  }
}
// -----------------------------------------------------------------------------
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
  <div
    id="{uid}-table-container"
    class="table-container"
    style:height="{(maxRowsVis + nH + nF) * rowH}px"
    on:scroll="{onscroll}">
    {#if rl.length === 0}
      <pre>Loading...</pre>
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
            <div class="row-th" style:grid-template-columns="{colWsStr}">
              {#each rl.fieldsToShow as field}
                <div class="cell th sticky-top">
                  {field}
                </div>
              {/each}
            </div>
          {/if}
          <!-- header END -->

          {#each rows as i}
            <div class="row-td" style:grid-template-columns="{colWsStr}">
              {#each rl.fieldsToShow as field, j}
                <div id="{uid}-cell-td-{i}-{j}" class="cell td">
                  {rl.valueByIndex(i, field, '')}
                </div>
              {/each}
            </div>
          {/each}

          <!-- footer BEG -->
          {#if showFooterRow}
            <div class="row-tf" style:grid-template-columns="{colWsStr}">
              {#each rl.fieldsToShow as field}
                <div class="cell tf sticky-bottom">
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
            {#each rl.fieldsToShow as _, i}
              <resizer
                id="{uid}-col-sizer-{i}"
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

.row-th,
.row-td,
.row-tf {
  display: grid;
}

.cell {
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

.th,
.tf {
  position: sticky;
}

.th {
  top: 0;
}

.tf {
  bottom: 0;
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
