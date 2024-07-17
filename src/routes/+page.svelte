<script lang="ts">
// ---------------------------------------------------------------------------
import { onMount, onDestroy } from 'svelte'

import { BROWSER } from '$lib/app/api'
import state, { saveState } from '$lib/app/svelte-stores/state'
import { getFontSize } from '$lib/app/api'

import databases from '$lib/app/svelte-stores/databases'

import {
  createCollection,
  deleteCollection,
  relabelCollection
} from '$lib/app/api/db/collections'

import {
  addSeqRecsToCollection,
  removeSeqRecsFromCollection
} from '$lib/app/api/db/gbseq'

import type { IndexedUndefined } from '$lib/types'
import { type Doc, SeqRecordDoc, AlignmentDoc } from '$lib/doc'
import { RecordList } from '$lib/utils/record-list'

import ResizableGrid from '$lib/ui/views/ResizableGrid'
import TreeView from '$lib/ui/views/TreeView'
import TableView from '$lib/ui/views/TableView'
// ---------------------------------------------------------------------------

let dbs: Awaited<typeof databases>

// ---------------------------------------------------------------------------
onMount(async () => {
  dbs = await databases
})

onDestroy(async () => {})
// ---------------------------------------------------------------------------

// RecordList for tvMain -----------------------------------------------------
let mainDocList: Doc[] = []
let mainDocListRL: RecordList<Doc>
$: mainDocListRL = new RecordList<Doc>(mainDocList ?? [])
$: mainDocListRLHack = mainDocListRL as unknown as RecordList<IndexedUndefined>
// RecordList for tvMain END -------------------------------------------------

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

// Collections / State -------------------------------------------------------
let selectedCollGroup = $state.selectedCollGroup as string | undefined
let selectedColl = $state.selectedColl as string | undefined
let expndUserCollIds = $state.expndUserCollIds as Set<string> | undefined
let expndSeqCatCollIds = $state.expndSeqCatCollIds as Set<string> | undefined

$: {
  $state.selectedCollGroup = selectedCollGroup
  $state.selectedColl = selectedColl
  $state.expndUserCollIds = expndUserCollIds
  $state.expndSeqCatCollIds = expndSeqCatCollIds
  saveState()
}

let seqCatsToShow: string[] | undefined = undefined
let userCollRebuildTag: number
// Collections / State END ---------------------------------------------------
</script>

{#if $dbs && $dbs.dbsOK}
  <ResizableGrid
    nRow="{1}"
    nCol="{2}"
    rowHs="{[-1]}"
    bind:colWs="{gridLRColWs}"
    minColW="{0}">
    {#if $dbs.dbCollections && $dbs.dbSeqRecs && $dbs.dbTaxonomy}
      <ResizableGrid
        nRow="{1}"
        nCol="{1}"
        rowHs="{[-1]}"
        colWs="{[-1]}"
        minRowH="{0}"
        enforceMaxSize="{false}">
        <div class="grid-left-tree">
          <TreeView
            uid="{'collections-user'}"
            rootLabel="Collections"
            tableName="user"
            db="{$dbs.dbCollections}"
            expanded="{true}"
            bind:selected="{selectedColl}"
            bind:selectedGroupUid="{selectedCollGroup}"
            bind:expandedIds="{expndUserCollIds}"
            bind:rebuild="{userCollRebuildTag}"
            contextMenuEnabled="{true}"
            createNodeEnabled="{true}"
            deleteNodeEnabled="{true}"
            relabelNodeEnabled="{true}"
            createNode="{createCollection}"
            deleteNode="{deleteCollection}"
            relabelNode="{relabelCollection}"
            addRecords="{addSeqRecsToCollection}"
            acceptedDropTypes="{['acc-ver-array']}" />

          <TreeView
            uid="{'collections-search-results'}"
            rootLabel="Sequence Search"
            tableName="search_results"
            db="{$dbs.dbCollections}"
            expanded="{true}"
            bind:selected="{selectedColl}"
            bind:selectedGroupUid="{selectedCollGroup}"
            createNode="{createCollection}"
            deleteNode="{deleteCollection}"
            relabelNode="{relabelCollection}" />

          <TreeView
            uid="{'collections-seq-categories'}"
            rootLabel="All Records"
            tableName="sequence_type"
            db="{$dbs.dbCollections}"
            expanded="{true}"
            bind:selected="{selectedColl}"
            bind:selectedGroupUid="{selectedCollGroup}"
            bind:expandedIds="{expndSeqCatCollIds}"
            bind:selectedChildIds="{seqCatsToShow}"
            selectedChildIdsEnabled />
        </div>
      </ResizableGrid>
    {:else}
      <div>Loading...</div>
    {/if}

    <ResizableGrid
      bind:nRow="{gridMainNRow}"
      bind:nCol="{gridMainNCol}"
      bind:rowHs="{gridMainRowHs}"
      bind:colWs="{gridMainColWs}"
      bind:rowBorders="{gridMainRowBorders}"
      minRowH="{0}"
      minColW="{0}">
      <div class="grid-main-filter-search">
        {#if selectedCollGroup === 'collections-search-results'}
          {#key selectedCollGroup}
            <div class="placeholder">search</div>
          {/key}
        {:else}
          {#key selectedCollGroup}
            <div class="placeholder">filter</div>
          {/key}
        {/if}
      </div>

      <div class="grid-main-tableview">
        <TableView
          uid="seq-rec-table"
          rl="{mainDocListRLHack}"
          bind:rowHeight="{tvMainRowH}"
          showCheckBoxes
          multiRowSelect
          showHeaderRow />
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
.placeholder {
  margin: auto;
  background-color: transparent;
  align-content: center;
  text-align: center;
}

.grid-left-tree {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: transparent;
  // background-color: red;
}

.grid-main-filter-search {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: transparent;
  // background-color: green;
}

.grid-main-tableview {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: transparent;
  // background-color: pink;
}

.grid-main-seqview {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: transparent;
  // background-color: yellow;
}
</style>
