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
import {
  getSeqRecIdsByCategory,
  getSeqRecIdsForCollections
} from '$lib/api/db/gbseq'
// ---------------------------------------------------------------------------
onMount(async () => {
  dbs = await databases
  const sf: DocField[] = $state.mdlSF ? ($state.mdlSF as DocField[]) : ['id']
  const sd: SortDir[] = $state.mdlSD ? ($state.mdlSD as SortDir[]) : [1]
  mainDocList = new DocList($dbs, 'main-doc-list', sf, sd)
  addEventListener(mainDocList.updatedEventName, mdlUpdatedEventListener)
})
onDestroy(async () => {
  removeEventListener(mainDocList.updatedEventName, mdlUpdatedEventListener)
})
// ---------------------------------------------------------------------------
const mdlUpdatedEventListener = () => {
  $state.mdlSF = mainDocList.list.sortFields
  $state.mdlSD = mainDocList.list.sortDirections
  saveState()
}
// ---------------------------------------------------------------------------
let dbs: Awaited<typeof databases>
let mainDocList: DocList
// ---------------------------------------------------------------------------
let selCollGrp: string | undefined
let selColl: string | undefined
let idsByColl: Set<string>
let idsFinal: Set<string> = new Set()
// ---------------------------------------------------------------------------
let selMolTypes: string[] | undefined
let selOrgnells: string[] | undefined
let selOthers: string[] | undefined

let idsByMolType: Set<string> = new Set()
let idsByOrgnell: Set<string> = new Set()
let idsByOthers: Set<string> = new Set()
let idsByCat: Set<string> = new Set()
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
async function _getIdsByColl(
  selCollGrp: string,
  selColl: string,
  idsByCat: Set<string>
) {
  if (idsByCat.size > 0) {
    if (selCollGrp === 'coll-db-all-recs' && selColl === 'ROOT') {
      idsByColl = new Set(mainDocList.list.allKeys)
    } else if (selCollGrp === 'coll-user') {
      idsByColl = new Set(
        await getSeqRecIdsForCollections('user', [selColl], $dbs, 'dbSeqRecs')
      )
    }
  } else {
    idsByColl = new Set()
  }
}

async function _getIdsByMolType(selMolTypes: string[]) {
  idsByMolType = new Set(
    await getSeqRecIdsByCategory('moltype', selMolTypes, $dbs, 'dbSeqRecs')
  )
}

async function _getIdsByOrgnell(selOrgnells: string[]) {
  idsByOrgnell = new Set(
    await getSeqRecIdsByCategory('organelle', selOrgnells, $dbs, 'dbSeqRecs')
  )
}

async function _getIdsByOthers(selOthers: string[]) {
  idsByOthers = new Set(
    await getSeqRecIdsByCategory('other', selOthers, $dbs, 'dbSeqRecs')
  )
}

$: {
  if (selMolTypes && selMolTypes.length > 0) {
    _getIdsByMolType(selMolTypes)
  }
}

$: {
  if (selOrgnells && selOrgnells.length > 0) {
    _getIdsByOrgnell(selOrgnells)
  }
}

$: {
  if (selOthers && selOthers.length > 0) {
    _getIdsByOthers(selOthers)
  }
}
// ---------------------------------------------------------------------------
// $: console.log(selCollGrp)
// $: console.log(selColl)
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

$: {
  const prev = idsByCat
  const curr = idsByMolType.intersection(idsByOrgnell).intersection(idsByOthers)
  if (prev.difference(curr).size !== 0 || curr.difference(prev).size !== 0) {
    idsByCat = curr
  }
}

$: if (selCollGrp && selColl) _getIdsByColl(selCollGrp, selColl, idsByCat)

$: if (idsByColl !== undefined) {
  const prev = idsFinal
  const curr = idsByColl.intersection(idsByCat)
  if (prev.difference(curr).size !== 0 || curr.difference(prev).size !== 0) {
    idsFinal = curr
  }
}

$: if (mainDocList) mainDocList.list.filterBy('id', undefined, [...idsFinal])
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
        bind:selCollGrp
        bind:selColl
        bind:selMolTypes
        bind:selOrgnells
        bind:selOthers />
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
        <MainFilterSearch bind:selCollGrp />
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
