<script lang="ts">
import { onMount, onDestroy, afterUpdate } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import status from '$lib/app/svelte-stores/status'

onMount(() => {
  colSizesStringX = '1fr 1fr 1fr 1fr'
  getColSizes()
})

afterUpdate(() => {
  getColSizes()
  if (columnHeight) {
    const elt = document.getElementById('table') as HTMLElement
    const elm = document.getElementById('main') as HTMLElement
    const tableHeight = columnHeight * (rowsToShow.length + 2)
    const tableHeightFull = columnHeight * (rl.length + 2)
    console.log(
      columnHeight,
      rowsToShow.length,
      tableHeight,
      elt.offsetHeight,
      elm.offsetHeight,
      Math.floor(elm.offsetHeight / columnHeight) - 2,
      tableHeightFull
    )
    console.log()
  }
})

onDestroy(() => {
  $status.main = ''
})

let columnHeight: number = 0
let columnWidths: number[] = []

async function getColSizes() {
  const n = rl.fieldsToShow.length
  for (let i = 0; i < n; i++) {
    const el = document.getElementById(`col-${i}`)
    if (el) columnWidths[i] = el.offsetWidth
    if (el) columnHeight = el.offsetHeight
  }
}

export let rl: RecordList<any>
$: $status.main = `${rl.length.toLocaleString()} records`

let moreRows: boolean = false
let rowsToShow: number[] = []
$: rowsToShow = prepRows(moreRows, rl)

$: tableHeightFull = columnHeight * (rl.length + 2)

function prepRows(_moreRows: boolean, _rl: RecordList<any>): number[] {
  const rv: number[] = []
  const start = 0
  // const end = 52
  const end = 100000
  for (let i = start; i < Math.min(end, _rl.length); i++) {
    rv.push(i)
  }
  moreRows = false
  return rv
}

// -----------------------------------------------------------------------------
onmouseup = resizeColEnd
onmousemove = resizeCol

let colSizesStringX: string
let resizeStartX: number | null = null
let colInintialWidth: number | null = null
let colDragged: number | null = null
let tableElement: HTMLElement | null = null

async function resizeColBegin(evt: MouseEvent) {
  document.body.style.cursor = 'col-resize'
  getColSizes()
  resizeStartX = evt.x
  const col = Number((evt.target as HTMLElement).id.replace('resizer-col-', ''))
  colInintialWidth = columnWidths[col]
  colDragged = col
  tableElement = document.getElementById('table') as HTMLElement
}

async function resizeCol(evt: MouseEvent) {
  if (
    colDragged !== null &&
    resizeStartX !== null &&
    colInintialWidth !== null &&
    tableElement !== null
  ) {
    const dist = evt.x - resizeStartX
    columnWidths[colDragged] = Math.max(50, colInintialWidth + dist)
    let _ = ''
    columnWidths.forEach((w) => {
      _ += `${w}px `
    })
    tableElement.style.gridTemplateColumns = _
  }
}

async function resizeColEnd(evt: MouseEvent) {
  if (tableElement !== null) {
    const _ = tableElement.style.gridTemplateColumns
    if (_) colSizesStringX = _
  }
  resizeStartX = null
  colInintialWidth = null
  colDragged = null
  tableElement = null
  document.body.style.cursor = 'default'
}
// -----------------------------------------------------------------------------
</script>

{#if rl.length === 0}
  Loading...
{:else if rl.fieldsToShow.length === 0}
  Field list is undefined.
{:else}
  <div
    style="min-height: {tableHeightFull}px; max-height: {tableHeightFull}px;">
    <div
      id="table"
      class="table"
      style="--grid-template-columns:{colSizesStringX}">
      {#each rl.fieldsToShow as field, i}
        <div id="col-{i}" class="cell th sticky-top">
          {field}
          <resizer
            id="resizer-col-{i}"
            class="resizer-col"
            role="none"
            on:mousedown="{resizeColBegin}"></resizer>
        </div>
      {/each}
      {#each rowsToShow as i}
        {#each rl.fieldsToShow as field, j}
          <div id="cell-td-{i}-{j}" class="cell">
            {rl.valueByIndex(i, field, '')}
          </div>
        {/each}
      {/each}
      {#each rl.fieldsToShow as field}
        <div class="cell tf sticky-bottom">
          {field}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
.table {
  display: grid;
  font-family: 'JetBrains Mono';
  grid-template-columns: var(--grid-template-columns);

  .cell {
    text-wrap: nowrap;
    background-color: var(--bg);
    overflow: hidden;
    text-overflow: ellipsis;
    padding-inline: 0.25rem;
    // padding-block: 0.125rem;
    // border-inline-end-style: solid;
  }

  .sticky-top,
  .sticky-bottom {
    position: sticky;
  }

  .th.sticky-top {
    top: 0;
  }

  .tf.sticky-bottom {
    bottom: 0;
  }

  .th,
  .tf {
    background-color: var(--primary);
    color: var(--fg-inv);
    font-weight: bold;
  }
}

.resizer-col {
  position: absolute;
  display: inline-block;
  right: 0rem;
  width: 1rem;
  height: 100%;
  cursor: col-resize;
}
</style>
