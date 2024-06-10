<script lang="ts">
import state from '$lib/app/svelte-stores/state'
import { saveState } from '$lib/app/svelte-stores/state'
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import TreeView from '$lib/ui/views/TreeView'
import TableView from '$lib/ui/views/TableView'
import { RecordList } from '$lib/utils/record-list'
import { onMount, onDestroy, tick } from 'svelte'
import {
  createCollection,
  deleteCollection,
  relabelCollection
} from '$lib/app/api/db/collections'
import databases from '$lib/app/svelte-stores/databases'
import {
  getSeqRecsByType,
  getSeqRecsFromCollection
} from '$lib/app/api/db/gbseq'
import type { IndexedUndefined } from '$lib/types'
import {
  addSeqRecsToCollection,
  removeSeqRecsFromCollection
} from '$lib/app/api/db/gbseq'
import status from '$lib/app/svelte-stores/status'
import settings from '$lib/app/svelte-stores/settings'
import { BROWSER } from '$lib/app/api'
import Search from './search.svelte'
import Filter from './filter.svelte'
import { getFontSize } from '$lib/app/api'
import { filterSeqRecs } from '$lib/app/api/db/gbseq'

let seqRecList: IndexedUndefined[] = []
let statusMain: string = ''

let searchTerm: string = ''

let filterTerm: string = ''
let filteredResults: IndexedUndefined[] | undefined
let filteredIds: string[] | undefined

async function _filterSeqRecs(term: string) {
  if (term) {
    const rv = await filterSeqRecs(term)
    filteredResults = rv
  } else {
    filteredResults = undefined
    filteredIds = undefined
  }
}

$: _filterSeqRecs(filterTerm)
$: if (filteredResults)
  filteredIds = filteredResults.map((x) => x.Accession as string)

$: statusMain = `Showing ${seqRecListRL.length.toLocaleString($settings.locale)} / ${seqRecList.length.toLocaleString($settings.locale)} records.`
$: updateStatus(statusMain)

async function updateStatus(msg: string) {
  $status.main = msg
}

let dbs: Awaited<typeof databases>

let rebuild: number

let selectedGroupUid: string | undefined = $state.selectedGroupUid as
  | string
  | undefined
$: {
  $state.selectedGroupUid = selectedGroupUid
  saveState()
}

let selectedColl: string | undefined = $state.selectedColl as string | undefined
$: {
  $state.selectedColl = selectedColl
  saveState()
}

let expandedSeqTypeIds: Set<string> | undefined = $state.expandedSeqTypes as
  | Set<string>
  | undefined
$: {
  $state.expandedSeqTypes = expandedSeqTypeIds
  saveState()
}

let expandedCollIds: Set<string> | undefined = $state.expandedCollIds as
  | Set<string>
  | undefined
$: {
  $state.expandedCollIds = expandedCollIds
  saveState()
}

// let selectedTaxon: string | undefined = undefined

let selectedSeqTypes: string[] | undefined = undefined

let activeRecordId: string | undefined = undefined
let selectedRecordIds: string[] = []

let rowHeight: number | undefined = undefined
const nRowsToShow: number = 15

let nRowMain: number = 3
let rowHs: number[] = []
let prevRowHs: number[] = []

$: {
  if (rowHeight && rowHs.length === 0) {
    // getFontSize() * 3
    rowHs = [getFontSize() * 3, 34 + 1 + (rowHeight ? rowHeight : 0) * (nRowsToShow - 1), -1]
    prevRowHs = [...rowHs]
  }
}

// $: {
//   if (selectedGroupUid === 'search-results-tree') {
//     if (rowHs.length === 2) {
//       prevRowHs = [...rowHs]
//       nRowMain = 3
//       rowHs.unshift(200)
//       rowHs[1] = rowHs[1] - 100
//     }
//   } else {
//     if (rowHs.length === 3) {
//       nRowMain = 2
//       rowHs = prevRowHs
//     }
//   }
// }

async function _getSeqRecs(
  collUid: string | undefined,
  collectionId: string | undefined,
  selectedSeqTypes: string[] | undefined,
  rebuild: number
) {
  if (
    $dbs &&
    $dbs.dbsOK &&
    collUid !== undefined &&
    collectionId !== undefined
  ) {
    if (collUid === 'user-tree') {
      seqRecList = await getSeqRecsFromCollection('user', [collectionId])
    } else if (collUid === 'sequence-type-tree') {
      if (selectedSeqTypes !== undefined) {
        seqRecList = await getSeqRecsByType(selectedSeqTypes)
      } else {
        seqRecList = []
      }
    } else {
      seqRecList = []
    }
  } else {
    seqRecList = []
  }
}

async function _removeSeqRec(id: unknown) {
  if (selectedGroupUid === 'user-tree' && selectedColl !== undefined) {
    await removeSeqRecsFromCollection([id as string], selectedColl)
    rebuild += 1
    await tick()
  } else {
    console.log('_removeSeqRec: doing nothing.')
  }
}

$: if ($dbs && $dbs.dbsOK)
  _getSeqRecs(selectedGroupUid, selectedColl, selectedSeqTypes, rebuild)

$: seqRecListRL = new RecordList<IndexedUndefined>(seqRecList ?? [])
$: if (seqRecListRL) {
  seqRecListRL.fieldsToShow = [
    'Accession',
    // 'TaxID',
    'Organism',
    // 'Length',
    'Length (bp)',
    'Genetic Compartment',
    'Molecule Type',
    'Definition'
  ]
}

$: if (seqRecListRL) {
  seqRecListRL.filterBy('Accession', undefined, filteredIds)
  seqRecListRL = seqRecListRL
}

function onSeqDbUpdated(ev: Event) {
  console.log('onSeqDbUpdated')
  _getSeqRecs(selectedGroupUid, selectedColl, selectedSeqTypes, rebuild)
}

function onSeqDbInsertInProgress(ev: Event) {
  console.log('onSeqDbInsertInProgress')
  _getSeqRecs(selectedGroupUid, selectedColl, selectedSeqTypes, rebuild)
}

onMount(async () => {
  dbs = await databases
  document.addEventListener(
    'seq-db-insert-in-progress',
    onSeqDbInsertInProgress
  )
  document.addEventListener('seq-db-updated', onSeqDbUpdated)
})

onDestroy(() => {
  document.removeEventListener(
    'seq-db-insert-in-progress',
    onSeqDbInsertInProgress
  )
  document.removeEventListener('seq-db-updated', onSeqDbUpdated)
  // saveState()
})
</script>

{#if $dbs && $dbs.dbsOK}
  <ResizableGrid
    nRow="{1}"
    nCol="{2}"
    rowHs="{[-1]}"
    colWs="{[200, -1]}"
    minColW="{0}">
    {#if $dbs.dbCollections && $dbs.dbSeqRecs && $dbs.dbTaxonomy}
      <ResizableGrid
        nRow="{1}"
        nCol="{1}"
        rowHs="{[-1]}"
        colWs="{[-1]}"
        minRowH="{0}"
        enforceMaxSize="{false}">
        <div class="tree-container">
          <TreeView
            uid="{'user-tree'}"
            expanded="{true}"
            db="{$dbs.dbCollections}"
            tableName="user"
            rootLabel="Collections"
            contextMenuEnabled="{true}"
            createNodeEnabled="{true}"
            deleteNodeEnabled="{true}"
            relabelNodeEnabled="{true}"
            bind:selected="{selectedColl}"
            bind:selectedGroupUid
            bind:rebuild
            bind:expandedIds="{expandedCollIds}"
            acceptedDropTypes="{['acc-ver-array']}"
            createNode="{createCollection}"
            deleteNode="{deleteCollection}"
            relabelNode="{relabelCollection}"
            addRecords="{addSeqRecsToCollection}" />
          <TreeView
            uid="{'search-results-tree'}"
            expanded="{true}"
            db="{$dbs.dbCollections}"
            tableName="search_results"
            rootLabel="Sequence Search"
            bind:selected="{selectedColl}"
            bind:selectedGroupUid
            createNode="{createCollection}"
            deleteNode="{deleteCollection}"
            relabelNode="{relabelCollection}" />
          <TreeView
            uid="{'sequence-type-tree'}"
            expanded="{true}"
            db="{$dbs.dbCollections}"
            tableName="sequence_type"
            rootLabel="All Records"
            bind:selected="{selectedColl}"
            bind:selectedGroupUid
            bind:selectedChildIds="{selectedSeqTypes}"
            bind:expandedIds="{expandedSeqTypeIds}" />
        </div>
        <!--
        <div class="tree-container">
          <TreeView
            uid="{'taxonomy-tree'}"
            expanded="{true}"
            db="{$dbs.dbTaxonomy}"
            tableName="tree"
            rootLabel="Taxonomy"
            parentId="{'1'}"
            rootId="{'1'}"
            bind:selected="{selectedTaxon}" />
        </div>
        -->
      </ResizableGrid>
    {:else}
      <div>Loading...</div>
    {/if}

    <ResizableGrid
      bind:nRow="{nRowMain}"
      rowBorders="{[false, true]}"
      nCol="{1}"
      bind:rowHs
      colWs="{[-1]}"
      minRowH="{0}"
      fixedHRows="{[]}">
      <div class="filter-search">
        {#if selectedGroupUid === 'search-results-tree'}
          {#key selectedGroupUid}
            <Search bind:term="{searchTerm}" />
          {/key}
        {:else}
          {#key selectedGroupUid}
            <Filter bind:term="{filterTerm}" />
          {/key}
        {/if}
      </div>

      <div class="list-container">
        <TableView
          uid="seq-rec-table"
          rl="{seqRecListRL}"
          bind:activeRowKey="{activeRecordId}"
          bind:selectedRecordIds
          bind:rowHeight
          onDeleteRow="{_removeSeqRec}"
          showCheckBoxes
          multiRowSelect
          showHeaderRow />
      </div>
      <div class="placeholder">
        {selectedColl
          ? selectedGroupUid +
            ' : ' +
            selectedColl +
            (activeRecordId ? ` : ${activeRecordId}` : '')
          : ''}
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
  align-content: center;
  text-align: center;
  margin: auto;
  background-color: white;
}

.filter-search {
  overflow: hidden;
}

.list-container {
  align-content: unset;
  text-align: unset;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: white;
}

.tree-container {
  display: flex;
  flex-direction: column;
  align-content: unset;
  text-align: unset;
  overflow-x: hidden;
  overflow-y: scroll;
}
</style>
