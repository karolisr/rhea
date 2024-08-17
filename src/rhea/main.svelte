<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte'

import { gSysInfo } from '$lib/backend/system-info'
import { getFontSize } from '$lib/utils'

import { appState, saveAppState } from '$lib/stores/state'
import databases from '$lib/stores/databases'

import type { SortDir } from '$lib/types'
import { DocListMain } from '$lib/models/doc/doc-list-main'
import { DocListSrch } from '$lib/models/doc/doc-list-srch'
import type { DocField } from '$lib/models/doc'
import { SeqList } from '$lib/seq/seq-list'

import { ResizableGrid } from '$lib/ui/resizable-grid'
import { SeqView } from '$lib/ui/seq-view'

import {
  getSeqRecIdsByCategory,
  getSeqRecIdsForCollections
} from '$lib/backend/db/seqrecs'

import MainDocTable from './main-doc-table.svelte'
import MainCollections from './main-collections.svelte'
import FilterSearch from './main-filter-search/filter-search.svelte'
import SearchDocTable from './main-filter-search/search-doc-table.svelte'

// ----------------------------------------------------------------------------

let dbs: Awaited<typeof databases>
let docListMain: DocListMain
let docListSrch: DocListSrch
let collUpdatedSrch: boolean = false
let collRebuildSrch: number
let expCollsSrch: Set<string>

$: if (collUpdatedSrch) {
  collRebuildSrch = collRebuildSrch + 1
  collUpdatedSrch = false
}

onMount(async () => {
  dbs = await databases
  const sf: DocField[] = $appState.mdlSF
    ? ($appState.mdlSF as DocField[])
    : ['id']
  const sd: SortDir[] = $appState.mdlSD ? ($appState.mdlSD as SortDir[]) : [1]
  docListMain = new DocListMain($dbs, 'main-doc-list', sf, sd)
  addEventListener(docListMain.updatedEventName, mdlUpdatedEventListener)

  docListSrch = new DocListSrch($dbs, 'search-doc-list')
  // addEventListener(docListSrch.updatedEventName, sdlUpdatedEventListener)

  addEventListener('seq-db-updated', dbUpdatedListener)
})

onDestroy(() => {
  removeEventListener(docListMain.updatedEventName, mdlUpdatedEventListener)
  // removeEventListener(docListSrch.updatedEventName, sdlUpdatedEventListener)
  removeEventListener('seq-db-updated', dbUpdatedListener)
})

// const sdlUpdatedEventListener = () => {}

const mdlUpdatedEventListener = async () => {
  $appState.mdlSF = docListMain.list.sortFields
  $appState.mdlSD = docListMain.list.sortDirections
  saveAppState()
}

const dbUpdatedListener = async () => {
  await docListMain.init()
  selMolTypes = selMolTypes
  selOrgnells = selOrgnells
  selOthers = selOthers
  collUpdated = true
}

// ----------------------------------------------------------------------------

let activeRowKey: string | undefined = undefined
let selectedRowKeys: string[] = []
let selDocIds: Set<string> = new Set()

let activeRowKeySrch: string | undefined = undefined
let selectedRowKeysSrch: string[] = []
let selDocIdsSrch: Set<string> = new Set()

// ----------------------------------------------------------------------------

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
      idsByColl = new Set(docListMain.list.allKeys)
    } else if (selCollGrp === 'coll-user') {
      idsByColl = await getSeqRecIdsForCollections(
        'user',
        [selColl],
        $dbs,
        'dbSeqRecs'
      )
    } else {
      idsByColl = new Set()
    }
  } else {
    idsByColl = new Set()
  }
}

let selCollGrp: string | undefined
let selColl: string | undefined
let collUpdated: boolean = false
$: _getIdsByColl(selCollGrp, selColl, idsByCat)
$: if (collUpdated) {
  _getIdsByColl(selCollGrp, selColl, idsByCat)
  collUpdated = false
}

let idsFinalUnfiltered: Set<string> = new Set()
$: if (idsByColl !== undefined) {
  const prev = idsFinalUnfiltered
  const curr = idsByColl.intersection(idsByCat)
  if (prev.symmetricDifference(curr).size !== 0) {
    idsFinalUnfiltered = curr
  }
}

let idsByFilterTerm: Set<string> | undefined
let idsToShow: Set<string> = new Set()

$: {
  if (idsByFilterTerm === undefined) {
    idsToShow = idsFinalUnfiltered
  } else {
    idsToShow = idsFinalUnfiltered.intersection(idsByFilterTerm)
  }
}

$: {
  if (docListMain) {
    docListMain.list.filterBy('id', undefined, [...idsToShow])
  }
}

// ----------------------------------------------------------------------------
$: {
  let _idsToShowSel = new Set(selectedRowKeys).intersection(idsToShow)
  if (activeRowKey !== undefined) {
    if (_idsToShowSel.size === 0) {
      _idsToShowSel = new Set([activeRowKey])
    }
  }
  selDocIds = _idsToShowSel
}
// ----------------------------------------------------------------------------

let selCollsSrch: string[] | undefined

// ----------------------------------------------------------------------------
async function _prepareSeqList(
  selDocIds: Set<string>,
  selCollGrp: string | undefined
) {
  if (selCollGrp !== 'coll-search-results' && selDocIds.size > 0) {
    seqList = await docListMain.getSeqsForIds(selDocIds)
  } else {
    seqList = new SeqList([])
  }
}

let seqList: SeqList
$: _prepareSeqList(selDocIds, selCollGrp)
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
let tvMainNRowsToShow: number = 15
let tvMainRowH: number | undefined = undefined
let gridLeftColW: number =
  $appState.gridLeftColW !== undefined
    ? ($appState.gridLeftColW as number)
    : 200
let gridLRColWs: number[] = [gridLeftColW, -1]
let gridMainNRow: number = 3
let gridMainNCol: number = 1
let gridMainRowBorders: boolean[] = [true, true]
let gridMainColWs: number[] = [-1]
let gridMainRowHs: number[] = []

if ($appState.gridMainRowHs !== undefined) {
  gridMainRowHs = [...($appState.gridMainRowHs as number[])]
}

$: {
  $appState.gridLeftColW = gridLRColWs[0]

  if (tvMainRowH && gridMainRowHs.length === 0) {
    gridMainRowHs = [
      getFontSize() * 3,
      34 + 1 + (tvMainRowH ? tvMainRowH : 0) * (tvMainNRowsToShow - 1),
      -1
    ]
  }

  if (gridMainRowHs.length > 0) {
    $appState.gridMainRowHs = [...gridMainRowHs]
  }

  saveAppState()
}
// ----------------------------------------------------------------------------
</script>

{#if $dbs && $dbs.dbsOK}
  <ResizableGrid
    uid="{'grid-lr'}"
    rowHs="{[-1]}"
    bind:colWs="{gridLRColWs}"
    minColW="{0}">
    <div class="grid-left-tree">
      <MainCollections
        bind:selCollGrp
        bind:selColl
        bind:selMolTypes
        bind:selOrgnells
        bind:selOthers
        bind:expCollsSrch
        bind:collRebuildSrch
        bind:selCollsSrch
        {docListMain} />
    </div>
    <ResizableGrid
      uid="{'grid-search-filter-doclist-seqview'}"
      bind:rowHs="{gridMainRowHs}"
      bind:colWs="{gridMainColWs}"
      minRowH="{0}"
      minColW="{0}">
      <div class="grid-main-filter-search">
        <FilterSearch
          bind:selCollGrp
          bind:idsByFilterTerm />
      </div>

      <div class="grid-main-tableview">
        {#if selCollGrp === 'coll-search-results'}
          <SearchDocTable
            bind:tvMainRowH
            bind:docListSrch
            bind:activeRowKeySrch
            bind:selectedRowKeysSrch
            bind:selDocIdsSrch
            bind:selCollGrp
            bind:selColl
            bind:selCollsSrch
            bind:collUpdatedSrch />
        {:else}
          <MainDocTable
            bind:tvMainRowH
            bind:docListMain
            bind:activeRowKey
            bind:selectedRowKeys
            bind:selCollGrp
            bind:selColl
            bind:collUpdated />
        {/if}
      </div>

      <div class="grid-main-seqview">
        {#if seqList}
          <SeqView
            uid="main-seqview"
            seqs="{seqList}" />
        {/if}
      </div>
    </ResizableGrid>
  </ResizableGrid>
{:else}
  <div class="placeholder">
    {#if gSysInfo.browser === 'Tauri'}
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
