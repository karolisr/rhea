<script lang="ts">
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import TreeView from '$lib/ui/views/TreeView'
import TableView from '$lib/ui/views/TableView'
import { RecordList } from '$lib/utils/record-list'
import { onMount } from 'svelte'
import {
  createCollection,
  deleteCollection,
  relabelCollection
} from '$lib/app/api/db/collections'
import databases from '$lib/app/svelte-stores/databases'
import { getSeqRecList } from '$lib/app/api/db/gbseq'
import type { IndexedUndefined } from '$lib/types'
import { addSeqRecsToCollection } from '$lib/app/api/db/gbseq'

let dbs: Awaited<typeof databases>

let selectedGroupUid: string | undefined = 'collections-tree'
let selectedColl: string | undefined = 'ROOT'

let selectedTaxon: string | undefined = undefined

let activeRecordId: string | undefined = undefined
let selectedRecordIds: string[] = []

async function _addToCollection(accs: string[]) {
  if (selectedColl !== undefined) {
    await addSeqRecsToCollection(accs, selectedColl)
  }
}

async function _getSeqRecList(
  collUid: string | undefined,
  collection: string | undefined
) {
  if (collUid !== undefined && collection !== undefined) {
    if (collUid.startsWith('collections-tree')) {
      seqRecList = await getSeqRecList(collection)
    } else {
      seqRecList = []
    }
  } else {
    seqRecList = []
  }
}

let seqRecList: IndexedUndefined[]

$: _getSeqRecList(selectedGroupUid, selectedColl)

$: seqRecListRL = new RecordList<IndexedUndefined>(seqRecList ?? [])
$: if (seqRecListRL) {
  seqRecListRL.fieldsToShow = [
    'Accession',
    'TaxID',
    'Length',
    'Type',
    'Definition'
  ]
}

onMount(async () => {
  dbs = await databases
})
</script>

<ResizableGrid
  nRow="{1}"
  nCol="{2}"
  rowHs="{[-1]}"
  colWs="{[200, -1]}"
  minColW="{0}">
  {#if $dbs}
    <ResizableGrid
      nRow="{2}"
      nCol="{1}"
      rowHs="{[300, -1]}"
      colWs="{[-1]}"
      minRowH="{0}"
      enforceMaxSize="{false}">
      <div class="tree-container">
        <TreeView
          uid="{'collections-tree'}"
          expanded="{true}"
          db="{$dbs.dbCollections}"
          tableName="collections"
          rootLabel="Collections"
          contextMenuEnabled="{true}"
          createNodeEnabled="{true}"
          deleteNodeEnabled="{true}"
          relabelNodeEnabled="{true}"
          bind:selected="{selectedColl}"
          bind:selectedGroupUid
          createNode="{createCollection}"
          deleteNode="{deleteCollection}"
          relabelNode="{relabelCollection}" />

        <TreeView
          uid="{'all-records-tree'}"
          expanded="{true}"
          db="{$dbs.dbCollections}"
          tableName="seqtype"
          rootLabel="All Records"
          bind:selected="{selectedColl}"
          bind:selectedGroupUid />

        <TreeView
          uid="{'search-results-tree'}"
          expanded="{true}"
          db="{$dbs.dbCollections}"
          tableName="search_results"
          rootLabel="Search Results"
          bind:selected="{selectedColl}"
          bind:selectedGroupUid
          createNode="{createCollection}"
          deleteNode="{deleteCollection}"
          relabelNode="{relabelCollection}" />
      </div>
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
    </ResizableGrid>
  {:else}
    <div>Loading...</div>
  {/if}

  <ResizableGrid
    nRow="{2}"
    nCol="{1}"
    rowHs="{[34 + 1 + 17 * 10, -1]}"
    colWs="{[-1]}"
    minRowH="{0}">
    <div class="list-container">
      <TableView
        uid="seq-rec-list"
        rl="{seqRecListRL}"
        bind:activeRowKey="{activeRecordId}"
        bind:selectedRecordIds
        showCheckBoxes
        multiRowSelect
        showHeaderRow />
    </div>
    <div>
      {selectedColl
        ? selectedGroupUid +
          ' : ' +
          selectedColl +
          (activeRecordId ? ` : ${activeRecordId}` : '')
        : ''}
    </div>
  </ResizableGrid>
</ResizableGrid>

<style lang="scss">
div {
  align-content: center;
  text-align: center;
  background-color: white;
}

.list-container {
  align-content: unset;
  text-align: unset;
  overflow-x: hidden;
  overflow-y: hidden;
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
