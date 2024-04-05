<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import { min, max, floor } from '$lib'
// import status from '$lib/app/svelte-stores/status'

onDestroy(() => {
  // $status.main = ''
})

onMount(() => {
  elc = document.getElementById(`table-container-${uid}`) as HTMLElement
  elt = document.getElementById(`table-${uid}`) as HTMLElement
  elt.style.gridTemplateColumns = colWsStr
  calcHeights()
})

// $: $status.main = `${rl.length.toLocaleString()} records`

export let rl: RecordList<any>
export let showHeaderRow: boolean = true
export let showFooterRow: boolean = true
export let minColW: number = 50
export let uid: string

$: nHeadRow = showHeaderRow ? 1 : 0
$: nFootRow = showFooterRow ? 1 : 0

let rowH: number
let visH: number
let elc: HTMLElement
let elt: HTMLElement
let colWs: number[] = []
let colWsStr: string
let maxRowsVis: number
let rowsVis: number[] = []

let scrollTop: number = 0
let topRow: number

$: if (!colWsStr) {
  let _ = ''
  for (let i = 0; i < rl.fieldsToShow.length; i++) {
    _ += ` 1fr`
  }
  colWsStr = _.trim()
}

$: scrollHeight = rowH * (rl.length + (nHeadRow + nFootRow))
$: topRow = rowH && rowH > 0 ? floor(scrollTop / rowH) : 0
$: maxRowsVis =
  rowH && rowH > 0 ? max(floor(visH / rowH) - (nHeadRow + nFootRow), 0) : 0

addEventListener('resize', (_: UIEvent) => {
  visH = elc.offsetHeight
})

const onscroll = (_: Event) => {
  scrollTop = elc.scrollTop
}

function calcHeights() {
  const _ = document.createElement('div')
  _.className = 'cell'
  _.textContent = 'rowH'
  elt.appendChild(_)
  rowH = _.offsetHeight
  visH = elc.offsetHeight
  _.remove()
}

async function calcColWidths() {
  const n = rl.fieldsToShow.length
  let el
  for (let i = 0; i < n; i++) {
    el = document.getElementById(`cell-td-${uid}-${rowsVis[0]}-${i}`)
    if (el) colWs[i] = el.offsetWidth
  }
}

$: {
  if (
    min(...rowsVis) > max(topRow - maxRowsVis, 0) ||
    max(...rowsVis) < min(topRow + maxRowsVis, rl.length) ||
    visH
  ) {
    prepRows()
  }
}

function prepRows() {
  const _: number[] = []
  if (maxRowsVis > 0) {
    const start = topRow
    const end = topRow + maxRowsVis
    for (let i = max(0, start); i <= min(end, rl.length); i++) {
      _.push(i)
    }
    // console.log(min(..._), max(..._))
  }
  rowsVis = _
}

// -----------------------------------------------------------------------------

addEventListener('mousemove', (evt: MouseEvent) => {
  resizeCol(evt)
})

addEventListener('mouseup', (evt: MouseEvent) => {
  resizeColEnd(evt)
})

let colPrevX: number | null = null
let colPrevWidth: number | null = null
let colResizing: number | null = null

function resizeColBegin(evt: MouseEvent) {
  document.body.style.cursor = 'col-resize'
  calcColWidths()
  colPrevX = evt.x
  const col = Number(
    (evt.target as HTMLElement).id.replace(`col-sizer-${uid}-`, '')
  )
  colPrevWidth = colWs[col]
  colResizing = col
}

function resizeCol(evt: MouseEvent) {
  if (colResizing !== null && colPrevX !== null && colPrevWidth !== null) {
    window.requestAnimationFrame(() => {
      const d = evt.x - (colPrevX as number)
      colWs[colResizing as number] = max(minColW, (colPrevWidth as number) + d)
      let _ = ''
      colWs.forEach((w) => {
        _ += ` ${w}px`
      })
      elt.style.gridTemplateColumns = _.trim()
      colWsStr = _.trim()
    })
  }
}

function resizeColEnd(_: MouseEvent) {
  if (colResizing !== null && colPrevX !== null && colPrevWidth !== null) {
    colWsStr = elt.style.gridTemplateColumns
    colPrevX = null
    colPrevWidth = null
    colResizing = null
    document.body.style.cursor = 'default'
  }
}
// -----------------------------------------------------------------------------
</script>

<div id="table-container-{uid}" class="table-container" on:scroll="{onscroll}">
  <div
    id="table-scroll-container-{uid}"
    class="table-scroll-container"
    style="height:{scrollHeight}px; max-height:{scrollHeight}px;">
    <div id="table-{uid}" class="table">
      <div
        id="col-sizers-{uid}"
        class="col-sizers"
        style:grid-template-columns="{colWsStr}">
        {#each rl.fieldsToShow as _, i}
          <resizer
            id="col-sizer-{uid}-{i}"
            class="col-sizer"
            role="none"
            on:mousedown="{resizeColBegin}">
          </resizer>
        {/each}
      </div>
      {#if rl.length === 0}
        <pre>Loading...</pre>
      {:else if rl.fieldsToShow.length === 0}
        <pre>rl.fieldsToShow.length === 0</pre>
      {:else}
        {#if showHeaderRow}
          {#each rl.fieldsToShow as field, i}
            <div id="col-{uid}-{i}" class="cell th sticky-top">
              {field}
            </div>
          {/each}
        {/if}

        {#if rowsVis}
          {#each rl as _, i}
            {#if rowsVis.includes(i)}
              {#each rl.fieldsToShow as field, j}
                <div id="cell-td-{uid}-{i}-{j}" class="cell td">
                  {rl.valueByIndex(i, field, '')}
                </div>
              {/each}
            {/if}
          {/each}
        {/if}

        {#if showFooterRow}
          {#each rl.fieldsToShow as field}
            <div class="cell tf sticky-bottom">
              {field}
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  </div>
</div>

<!-- <div class="padded">
  <button
    disabled="{topRow <= 0}"
    on:click="{() => {
      elc.scrollTo({
        top: rowH * max(topRow - maxRowsVis, 0)
      })
    }}">U</button>

  <button
    disabled="{topRow + maxRowsVis + 1 >= rl.length}"
    on:click="{() => {
      elc.scrollTo({
        top: rowH * min(topRow + maxRowsVis, rl.length)
      })
    }}">D</button>
</div> -->

<style lang="scss">
.col-sizers {
  background-color: transparent;
  display: grid;
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  z-index: 0;
}

.col-sizer {
  position: relative;
  left: calc(100% - 0.75rem);
  width: 0.75rem;
  cursor: col-resize;
  transition: background-color 0.125s ease-in-out;
}

.col-sizer:hover,
.col-sizer:active {
  background-color: rgba($color: orange, $alpha: 0.25);
}

.table-container {
  background-color: transparent;
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: scroll;
  height: 100%;
}

.table-scroll-container {
  background-color: transparent;
}

.table {
  background-color: transparent;
  display: grid;
  font-family: 'JetBrains Mono';
  position: sticky;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.cell {
  background-color: var(--bg);
  color: var(--fg);
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  padding-inline: 0.125rem;
}

.td {
  background-color: transparent;
  border-inline-end-style: solid;
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
  background-color: transparent;
  font-weight: bold;
}

.th {
  background-color: var(--fg);
  color: var(--fg-inv);
}

.tf {
  background-color: var(--fg);
  color: var(--fg-inv);
}
</style>
