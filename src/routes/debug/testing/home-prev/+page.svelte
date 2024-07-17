<script lang="ts">
// import state from '$lib/svelte-stores/state'
// import { saveState } from '$lib/svelte-stores/state'
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import TreeView from '$lib/ui/views/TreeView'
import TableView from '$lib/ui/views/TableView'
import { RecordList } from '$lib/utils/record-list'
import { onMount, onDestroy, tick } from 'svelte'
import {
  createCollection,
  deleteCollection,
  relabelCollection
} from '$lib/api/db/collections'
import databases from '$lib/svelte-stores/databases'
import { getSeqRecsByType, getSeqRecsFromCollection } from '$lib/api/db/gbseq'
import type { IndexedUndefined } from '$lib/types'
import {
  addSeqRecsToCollection,
  removeSeqRecsFromCollection
} from '$lib/api/db/gbseq'
import status from '$lib/svelte-stores/status'
import settings from '$lib/svelte-stores/settings'
import { BROWSER } from '$lib/api'
import Search from './search.svelte'
import Filter from './filter.svelte'
import { getFontSize } from '$lib/api'
import { filterSeqRecs } from '$lib/api/db/gbseq'
import { getSequences } from '$lib/api/db/gbseq'
import SeqView from '$lib/ui/views/SeqView'
import { SeqRecord } from '$lib/seq/seq-record'
import { NTSeq, DNASeq, RNASeq, AASeq } from '$lib/seq/seq'
import type { Seq } from '$lib/seq/types'
import { SeqList } from '$lib/seq/seq-list'

// import { filterTaxonomy } from '$lib/api/db/taxonomy/fts'
// import { getLineage, cacheTaxIds } from '$lib/api/db/taxonomy/lineage'
// import { getPropNames } from '$lib'

let seqRecList: IndexedUndefined[] = []
let statusMain: string = ''

let searchTerm: string = ''

let filterTerm: string = ''
let filteredResults: IndexedUndefined[] | undefined
let filteredIds: string[] | undefined

let filterTermTax: string = ''
// let filteredResultsTax: IndexedUndefined[] | undefined
// let filteredTaxIds: string[] | undefined

// let taxIds: Set<number> = new Set()
// let lineages: { [id: number]: number[] } = {}

// async function _getLineage(taxId: number) {
//   if (taxId in lineages) {
//     console.log('Cache Hit.')
//     return lineages[taxId]
//   } else {
//     const l = await getLineage(taxId)
//     lineages[taxId] = l
//     console.log('Cache Miss.')
//     return l
//   }
// }

// function _getLineages(taxIds: Set<number>) {
//   ;[...taxIds].forEach((tid) => {
//     _getLineage(tid)
//   })
// }

// function _getTaxIds(seqRecList: IndexedUndefined[]) {
//   const _: Set<number> = new Set()
//   seqRecList.forEach((r) => {
//     _.add(r.TaxID as number)
//   })
//   return _
// }

// $: taxIds = _getTaxIds(seqRecList)
// $: _getLineages(taxIds)

// async function _filterTaxonomy(term: string) {
//   if (term) {
//     const rv = await filterTaxonomy(term)
//     filteredResultsTax = rv
//   } else {
//     filteredResultsTax = undefined
//     filteredTaxIds = undefined
//   }
// }

// $: _filterTaxonomy(filterTermTax)
// $: console.table(filteredResultsTax)

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

let selectedGroupUid: string | undefined
let selectedColl: string | undefined
let expandedSeqTypeIds: Set<string> | undefined
let expandedCollIds: Set<string> | undefined

// let selectedTaxon: string | undefined = undefined
let subsetSeqTypes: string[] | undefined = undefined

let rowHeight: number | undefined = undefined
const nRowsToShow: number = 15

let nRowMain: number = 3
let rowHs: number[] = []
let prevRowHs: number[] = []

let colWs: number[] = [-1]

// $: console.log(rowHs, colWs)

$: {
  if (rowHeight && rowHs.length === 0) {
    // getFontSize() * 3
    rowHs = [
      getFontSize() * 3,
      34 + 1 + (rowHeight ? rowHeight : 0) * (nRowsToShow - 1),
      -1
    ]
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
  subsetSeqTypes: string[] | undefined,
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
      if (subsetSeqTypes !== undefined) {
        seqRecList = await getSeqRecsByType(subsetSeqTypes)
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
  _getSeqRecs(selectedGroupUid, selectedColl, subsetSeqTypes, rebuild)

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
  _getSeqRecs(selectedGroupUid, selectedColl, subsetSeqTypes, rebuild)
}

function onSeqDbInsertInProgress(ev: Event) {
  console.log('onSeqDbInsertInProgress')
  _getSeqRecs(selectedGroupUid, selectedColl, subsetSeqTypes, rebuild)
}

let activeRecordId: string | undefined = undefined
let activeRecord: IndexedUndefined | undefined = undefined
// let activeRecordSeq: string | undefined = undefined
// let activeRecordSeqType: string | undefined = undefined
// $: if (activeRecord)
//   activeRecordSeqType = activeRecord['Molecule Type'] as string

// async function _getSeqForActiveRec(acc: string | undefined) {
//   if (acc !== undefined) {
//     const _ = await getSequences([acc])
//     if (_.length === 1 && _[0].acc === acc) {
//       activeRecordSeq = _[0].seq as string
//     } else {
//       activeRecordSeq = undefined
//     }
//   } else {
//     activeRecordSeq = undefined
//   }
// }

// $: _getSeqForActiveRec(activeRecordId)

async function _getSeqsForSelectedRecs(
  accsSelected: string[],
  accActive: string | undefined,
  accFiltered: string[] | undefined
) {
  let _accsSelected: string[] = [...accsSelected]
  let _accs: string[] = []
  let _moltypes: string[] = []
  const srs: SeqRecord[] = []

  // if (_accsSelected.length === 0 && accActive !== undefined) {
  //   _accsSelected = [accActive]
  // }

  for (let i = 0; i < _accsSelected.length; i++) {
    const acc = _accsSelected[i]
    const moltype = seqRecListRL.valueByKey(acc, 'Molecule Type')
    if (typeof moltype === 'string') {
      _accs.push(acc)
      _moltypes.push(moltype)
    }
  }

  if (_accs.length === 0 && accActive !== undefined) {
    const moltype = seqRecListRL.valueByKey(accActive, 'Molecule Type')
    if (typeof moltype === 'string') {
      _accs = [accActive]
      _moltypes = [moltype]
    }
  }

  const _ = await getSequences(_accs)
  for (let i = 0; i < _.length; i++) {
    const dbrv = _[i]
    const acc: string = dbrv.acc as string
    const seqstr: string = dbrv.seq as string
    const idx: number = _accs.indexOf(acc)
    const moltype: string = _moltypes[idx]

    let seq: Seq | undefined = undefined

    if (moltype.endsWith('RNA')) {
      seq = new RNASeq(seqstr)
    } else if (moltype === 'DNA') {
      seq = new DNASeq(seqstr)
    } else if (moltype === 'AA') {
      seq = new AASeq(seqstr)
    }

    if (seq !== undefined) {
      const sr = new SeqRecord(acc, seq)
      srs.push(sr)
    }
  }
  selectedRecords = srs
}

let selectedRecordIds: string[] = []
let selectedRecords: SeqRecord[] = []
$: _getSeqsForSelectedRecs(selectedRecordIds, activeRecordId, filteredIds)

onMount(async () => {
  dbs = await databases
  document.addEventListener(
    'seq-db-insert-in-progress',
    onSeqDbInsertInProgress
  )
  document.addEventListener('seq-db-updated', onSeqDbUpdated)
})

onDestroy(() => {
  $status.main = ''
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
    colWs="{[290, -1]}"
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
            bind:selectedChildIds="{subsetSeqTypes}"
            selectedChildIdsEnabled
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
      bind:colWs
      minRowH="{0}"
      minColW="{0}"
      fixedHRows="{[]}">
      <div class="filter-search">
        {#if selectedGroupUid === 'search-results-tree'}
          {#key selectedGroupUid}
            <Search bind:term="{searchTerm}" />
          {/key}
        {:else}
          {#key selectedGroupUid}
            <Filter bind:term="{filterTerm}" bind:termTax="{filterTermTax}" />
          {/key}
        {/if}
      </div>

      <div class="list-container">
        <TableView
          uid="seq-rec-table"
          rl="{seqRecListRL}"
          bind:activeRowKey="{activeRecordId}"
          bind:activeRowRecord="{activeRecord}"
          bind:selectedRecordIds
          bind:rowHeight
          onDeleteRow="{_removeSeqRec}"
          showCheckBoxes
          multiRowSelect
          showHeaderRow />
      </div>

      <div class="seqview-container">
        <SeqView uid="seqview-main" seqs="{new SeqList(selectedRecords)}" />
      </div>

      <!-- <div class="placeholder">
        {selectedColl
          ? selectedGroupUid +
            ' : ' +
            selectedColl +
            (activeRecordId ? ` : ${activeRecordId}` : '')
          : ''}
      </div> -->
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

.seqview-container {
  display: flex;
  align-content: unset;
  text-align: unset;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
