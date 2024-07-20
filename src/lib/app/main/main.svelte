<script lang="ts">
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import MainCollections from './main-collections.svelte'
import MainFilterSearch from './main-filter-search/main-filter-search.svelte'
import MainDocList from './main-doc-list.svelte'
import { onMount, onDestroy } from 'svelte'
import { BROWSER, getFontSize } from '$lib/api'
import state, { saveState } from '$lib/svelte-stores/state'
import databases from '$lib/svelte-stores/databases'
import { DocList } from '$lib/doc/doc-list'
import type { DocField } from '$lib/doc'
import type { SortDir } from '$lib/types'
// ---------------------------------------------------------------------------
onMount(async () => {
  dbs = await databases
  const sf: DocField[] = $state.mdlSF ? ($state.mdlSF as DocField[]) : ['id']
  const sd: SortDir[] = $state.mdlSD ? ($state.mdlSD as SortDir[]) : [1]
  mainDocList = new DocList('main-doc-list', sf, sd)
  addEventListener(mainDocList.updatedEventName, mdlUpdatedEventListener)
})
onDestroy(async () => {
  removeEventListener(mainDocList.updatedEventName, mdlUpdatedEventListener)
})

const mdlUpdatedEventListener = () => {
  $state.mdlSF = mainDocList.list.sortFields
  $state.mdlSD = mainDocList.list.sortDirections
  saveState()
}
// ---------------------------------------------------------------------------
let dbs: Awaited<typeof databases>
let mainDocList: DocList
// ---------------------------------------------------------------------------
let selectedCollGroup: string | undefined
let selectedColl: string | undefined
let selectedSeqCategories: string[] | undefined
// $: {
//   if (selectedSeqCategories && selectedSeqCategories.length > 0) {
//     console.log(selectedSeqCategories)
//   }
// }
// ---------------------------------------------------------------------------

// Grid / State --------------------------------------------------------------
let tvMainNRowsToShow: number = 15
let tvMainRowH: number | undefined = undefined
let gridLeftColW: number =
  $state.gridLeftColW !== undefined ? ($state.gridLeftColW as number) : 200
let gridLRColWs: number[] = [gridLeftColW, -1]
let gridMainNRow: number = 3
let gridMainNCol: number = 1
let gridMainRowBorders: boolean[] = [true, true]
let gridMainColWs: number[] = [-1]
let gridMainRowHs: number[] = []

if ($state.gridMainRowHs !== undefined) {
  gridMainRowHs = [...($state.gridMainRowHs as number[])]
}

$: {
  $state.gridLeftColW = gridLRColWs[0]

  if (tvMainRowH && gridMainRowHs.length === 0) {
    gridMainRowHs = [
      getFontSize() * 3,
      34 + 1 + (tvMainRowH ? tvMainRowH : 0) * (tvMainNRowsToShow - 1),
      -1
    ]
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
      <MainCollections
        bind:selectedCollGroup
        bind:selectedColl
        bind:selectedSeqCategories>
      </MainCollections>
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
        <MainFilterSearch bind:selectedCollGroup />
      </div>

      <div class="grid-main-tableview">
        <MainDocList bind:tvMainRowH bind:mainDocList />
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
