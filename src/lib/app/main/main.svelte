<script lang="ts">
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import MainCollections from './main-collections.svelte'
import MainFilterSearch from './main-filter-search/main-filter-search.svelte'
import MainDocList from './main-doc-list.svelte'
import { onMount, onDestroy } from 'svelte'
import { BROWSER, getFontSize } from '$lib/api'
import state, { saveState } from '$lib/svelte-stores/state'
import databases from '$lib/svelte-stores/databases'
import { type Doc } from '$lib/doc'
// ---------------------------------------------------------------------------

let dbs: Awaited<typeof databases>

// ---------------------------------------------------------------------------
onMount(async () => {
  dbs = await databases
})

onDestroy(async () => {})
// ---------------------------------------------------------------------------

let selectedCollGroup: string | undefined

let mainDocList: Doc[] = []

// Grid / State --------------------------------------------------------------
let tvMainNRowsToShow: number = 15
let tvMainRowH: number | undefined = undefined
let gridLeftColW: number = ($state.gridLeftColW as number | undefined) || 200
let gridLRColWs: number[] = [gridLeftColW, -1]
let gridMainNRow: number = 3
let gridMainNCol: number = 1
let gridMainRowBorders: boolean[] = [true, true]
let gridMainColWs: number[] = [-1]
let gridMainRowHs: number[] = []
let gridMainRowHsPrev: number[] = []

if ($state.gridMainRowHs !== undefined) {
  gridMainRowHs = [...($state.gridMainRowHs as number[])]
  gridMainRowHsPrev = [...gridMainRowHs]
}

$: {
  $state.gridLeftColW = gridLRColWs[0]

  if (tvMainRowH && gridMainRowHs.length === 0) {
    gridMainRowHs = [
      getFontSize() * 3,
      34 + 1 + (tvMainRowH ? tvMainRowH : 0) * (tvMainNRowsToShow - 1),
      -1
    ]
    gridMainRowHsPrev = [...gridMainRowHs]
  }

  if (gridMainRowHs.length > 0) {
    $state.gridMainRowHs = [...gridMainRowHs]
  }

  saveState()
}
// Grid / State END ----------------------------------------------------------
</script>

{#if $dbs && $dbs.dbsOK}
  <ResizableGrid
    nRow="{1}"
    nCol="{2}"
    rowHs="{[-1]}"
    bind:colWs="{gridLRColWs}"
    minColW="{0}">
    <div class="grid-left-tree">
      <MainCollections bind:selectedCollGroup></MainCollections>
    </div>
    <ResizableGrid
      bind:nRow="{gridMainNRow}"
      bind:nCol="{gridMainNCol}"
      bind:rowHs="{gridMainRowHs}"
      bind:colWs="{gridMainColWs}"
      bind:rowBorders="{gridMainRowBorders}"
      minRowH="{0}"
      minColW="{0}">
      <div class="grid-main-filter-search">
        <MainFilterSearch bind:selectedCollGroup></MainFilterSearch>
      </div>

      <div class="grid-main-tableview">
        <MainDocList bind:tvMainRowH bind:mainDocList></MainDocList>
      </div>

      <div class="grid-main-seqview">
        <div class="placeholder">grid-main-seqview</div>
      </div>
    </ResizableGrid>
  </ResizableGrid>
{:else}
  <div class="placeholder">
    {#if BROWSER === 'Tauri'}
      Loading...
    {:else}
      Database functionality not supported.
    {/if}
  </div>
{/if}

<style lang="scss">
.grid-left-tree {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: transparent;
}

.grid-main-filter-search {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: transparent;
}

.grid-main-tableview {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: transparent;
}

.grid-main-seqview {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: transparent;
}
</style>
