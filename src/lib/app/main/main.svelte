<script lang="ts">
import { onMount, onDestroy } from 'svelte'

import { BROWSER, getFontSize } from '$lib/api'

import state, { saveState } from '$lib/svelte-stores/state'
import databases from '$lib/svelte-stores/databases'

import type { SortDir } from '$lib/types'
import { DocList } from '$lib/doc/doc-list'
import type { DocField } from '$lib/doc'
import { SeqList } from '$lib/seq/seq-list'

import ResizableGrid from '$lib/ui/views/ResizableGrid'
import SeqView from '$lib/ui/views/SeqView'

import {
  getSeqRecIdsByCategory,
  getSeqRecIdsForCollections
} from '$lib/api/db/seqrecs'

import MainDocList from './main-doc-list.svelte'
import MainCollections from './main-collections.svelte'
import MainFilterSearch from './main-filter-search/main-filter-search.svelte'
// ----------------------------------------------------------------------------

let activeRowKey: string | undefined = undefined
let selectedRowKeys: string[] = []
let selectedDocIds: Set<string> = new Set()

$: {
  let _selectedDocIds = []
  if (activeRowKey !== undefined) {
    if (selectedRowKeys.length === 0) {
      _selectedDocIds = [activeRowKey]
    } else if (selectedRowKeys.includes(activeRowKey)) {
      _selectedDocIds = [...selectedRowKeys]
    } else {
      // _selectedDocIds = [activeRowKey, ...selectedRowKeys]
      _selectedDocIds = [...selectedRowKeys]
    }
  } else {
    _selectedDocIds = [...selectedRowKeys]
  }

  const curr = new Set(_selectedDocIds)
  if (selectedDocIds.symmetricDifference(curr).size !== 0) {
    selectedDocIds = curr
  }
}

async function _prepareSeqList(selectedDocIds: Set<string>) {
  seqList = await mainDocList.getSeqsForIds(selectedDocIds)
}

let seqList: SeqList
$: if (mainDocList) _prepareSeqList(selectedDocIds)

// ----------------------------------------------------------------------------
let dbs: Awaited<typeof databases>
let mainDocList: DocList

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

const mdlUpdatedEventListener = () => {
  _prepareSeqList(selectedDocIds)
  $state.mdlSF = mainDocList.list.sortFields
  $state.mdlSD = mainDocList.list.sortDirections
  saveState()
}

let idsByMolType: Set<string> = new Set()
async function _getIdsByMolType(selMolTypes: string[]) {
  idsByMolType = await getSeqRecIdsByCategory(
    'moltype',
    selMolTypes,
    $dbs,
    'dbSeqRecs'
  )
}

let idsByOrgnell: Set<string> = new Set()
async function _getIdsByOrgnell(selOrgnells: string[]) {
  idsByOrgnell = await getSeqRecIdsByCategory(
    'organelle',
    selOrgnells,
    $dbs,
    'dbSeqRecs'
  )
}

let idsByOthers: Set<string> = new Set()
async function _getIdsByOthers(selOthers: string[]) {
  idsByOthers = await getSeqRecIdsByCategory(
    'other',
    selOthers,
    $dbs,
    'dbSeqRecs'
  )
}

let selMolTypes: string[] | undefined
$: if (selMolTypes && selMolTypes.length > 0) {
  _getIdsByMolType(selMolTypes)
}

let selOrgnells: string[] | undefined
$: if (selOrgnells && selOrgnells.length > 0) {
  _getIdsByOrgnell(selOrgnells)
}

let selOthers: string[] | undefined
$: if (selOthers && selOthers.length > 0) {
  _getIdsByOthers(selOthers)
}

let idsByCat: Set<string> = new Set()
$: {
  const prev = idsByCat
  const curr = idsByMolType.intersection(idsByOrgnell).intersection(idsByOthers)
  if (prev.symmetricDifference(curr).size !== 0) {
    idsByCat = curr
  }
}

let idsByColl: Set<string>
async function _getIdsByColl(
  selCollGrp: string | undefined,
  selColl: string | undefined,
  idsByCat: Set<string>
) {
  if (selColl !== undefined && idsByCat.size > 0) {
    if (selCollGrp === 'coll-db-all-recs' && selColl === 'ROOT') {
      idsByColl = new Set(mainDocList.list.allKeys)
    } else if (selCollGrp === 'coll-user') {
      idsByColl = await getSeqRecIdsForCollections(
        'user',
        [selColl],
        $dbs,
        'dbSeqRecs'
      )
    }
  } else {
    idsByColl = new Set()
  }
}

let selCollGrp: string | undefined
let selColl: string | undefined
$: _getIdsByColl(selCollGrp, selColl, idsByCat)

let idsFinal: Set<string> = new Set()
$: if (idsByColl !== undefined) {
  const prev = idsFinal
  const curr = idsByColl.intersection(idsByCat)
  if (prev.symmetricDifference(curr).size !== 0) {
    idsFinal = curr
  }
}

$: if (mainDocList) mainDocList.list.filterBy('id', undefined, [...idsFinal])

// ----------------------------------------------------------------------------
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
// ----------------------------------------------------------------------------
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
        <MainDocList
          bind:tvMainRowH
          bind:mainDocList
          bind:activeRowKey
          bind:selectedRowKeys />
      </div>

      <div class="grid-main-seqview">
        <!-- <div class="placeholder">grid-main-seqview</div> -->
        {#if seqList}
          <SeqView uid="main-seqview" seqs="{seqList}" />
        {/if}
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
