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

let selectedColl: string | undefined = 'ROOT'
let selectedAll: string | undefined = 'ROOT'
let selectedTaxon: string | undefined = '1'
let selectedSrch: string | undefined = undefined
let activeRecordId: string | undefined = undefined
let selectedRecordIds: string[] = []

$: console.log(selectedRecordIds)
$: xxx(selectedRecordIds)

async function xxx(accs: string[]) {
  if (selectedColl !== undefined) {
    await addSeqRecsToCollection(accs, selectedColl)
  }
}

let seqRecList: IndexedUndefined[]
$: seqRecListRL = new RecordList<IndexedUndefined>(
  seqRecList ?? [],
  'accession_version'
)
$: if (seqRecListRL) {
  seqRecListRL.fieldsToShow = [
    'accession_version',
    'tax_id',
    'length',
    'moltype',
    'definition'
  ]
}

onMount(async () => {
  dbs = await databases
  seqRecList = await getSeqRecList()
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
      nRow="{4}"
      nCol="{1}"
      rowHs="{[150, 150, 150, 150]}"
      colWs="{[-1]}"
      minRowH="{0}"
      enforceMaxSize="{false}">
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
        createNode="{createCollection}"
        deleteNode="{deleteCollection}"
        relabelNode="{relabelCollection}" />

      <TreeView
        uid="{'all-records-tree'}"
        expanded="{true}"
        db="{$dbs.dbCollections}"
        tableName="seqtype"
        rootLabel="All Records"
        bind:selected="{selectedAll}"
        createNode="{createCollection}"
        deleteNode="{deleteCollection}"
        relabelNode="{relabelCollection}" />

      <TreeView
        uid="{'taxonomy-tree'}"
        expanded="{true}"
        db="{$dbs.dbTaxonomy}"
        tableName="tree"
        rootLabel="Taxonomy"
        parentId="{'1'}"
        rootId="{'1'}"
        bind:selected="{selectedTaxon}"
        createNode="{createCollection}"
        deleteNode="{deleteCollection}"
        relabelNode="{relabelCollection}" />

      <TreeView
        uid="{'search-results-tree'}"
        expanded="{true}"
        db="{$dbs.dbCollections}"
        tableName="search_results"
        rootLabel="Search Results"
        bind:selected="{selectedSrch}"
        createNode="{createCollection}"
        deleteNode="{deleteCollection}"
        relabelNode="{relabelCollection}" />
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
      <!-- <div>{selectedColl ?? ''}</div> -->
      <!-- <div>{selectedTaxon ?? ''}</div> -->
      <!-- <div>{selectedAll ?? ''}</div> -->
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
        ? selectedColl + (activeRecordId ? `: ${activeRecordId}` : '')
        : ''}
    </div>
  </ResizableGrid>
</ResizableGrid>

<style lang="scss">
div {
  align-content: center;
  text-align: center;
  background-color: white;
  // overflow-x: hidden;
  // overflow-y: scroll;
}

.list-container {
  align-content: unset;
  text-align: unset;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
