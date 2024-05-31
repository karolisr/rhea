<script lang="ts">
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import TreeView from '$lib/ui/views/TreeView'
import TableView from '$lib/ui/views/TableView'
import { RecordList } from '$lib/utils/record-list'
import { onMount } from 'svelte'
import { createCollection, deleteCollection, relabelCollection } from '$lib/app/api/db/collections'
import databases from '$lib/app/svelte-stores/databases'
import { getSeqRecs, getAllSeqRecs } from '$lib/app/api/db/gbseq'
import type { IndexedUndefined } from '$lib/types'
import { addSeqRecsToCollection } from '$lib/app/api/db/gbseq'

let dbs: Awaited<typeof databases>

let selectedGroupUid: string | undefined = 'user-tree'
let selectedColl: string | undefined = 'ROOT'

let selectedTaxon: string | undefined = undefined

let activeRecordId: string | undefined = undefined
let selectedRecordIds: string[] = []

let rowHeight: number | undefined = undefined
const nRowsToShow: number = 15

async function _addToCollection(ids: string[]) {
  if (selectedColl !== undefined) {
    await addSeqRecsToCollection(ids, selectedColl)
  }
}

async function _getSeqRecs(collUid: string | undefined, collectionId: string | undefined) {
  if ($dbs && $dbs.dbsOK && collUid !== undefined && collectionId !== undefined) {
    if (collUid === 'user-tree') {
      seqRecList = await getSeqRecs('user', [collectionId])
    } else if (collUid === 'sequence-type-tree') {
      if (collectionId === 'ROOT') {
        seqRecList = await getAllSeqRecs()
      } else {
        seqRecList = []
      }
      // seqRecList = await getSeqRecs('sequence_type', [collectionId])
    } else {
      seqRecList = []
    }
  } else {
    seqRecList = []
  }
}

let seqRecList: IndexedUndefined[]

$: _getSeqRecs(selectedGroupUid, selectedColl)

$: seqRecListRL = new RecordList<IndexedUndefined>(seqRecList ?? [])
$: if (seqRecListRL) {
  seqRecListRL.fieldsToShow = [
    'Accession',
    // 'TaxID',
    'Organism',
    'Length',
    'Genetic Compartment',
    'Molecule Type',
    'Definition'
  ]
}

onMount(async () => {
  dbs = await databases
})
</script>

{#if $dbs && $dbs.dbsOK}
  <ResizableGrid nRow="{1}" nCol="{2}" rowHs="{[-1]}" colWs="{[300, -1]}" minColW="{0}">
    {#if $dbs.dbCollections && $dbs.dbSequences && $dbs.dbTaxonomy}
      <ResizableGrid nRow="{2}" nCol="{1}" rowHs="{[400, -1]}" colWs="{[-1]}" minRowH="{0}" enforceMaxSize="{false}">
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
            acceptedDropTypes="{['acc-ver-array']}"
            createNode="{createCollection}"
            deleteNode="{deleteCollection}"
            relabelNode="{relabelCollection}" />
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
          <TreeView
            uid="{'sequence-type-tree'}"
            expanded="{true}"
            db="{$dbs.dbCollections}"
            tableName="sequence_type"
            rootLabel="All Records"
            bind:selected="{selectedColl}"
            bind:selectedGroupUid />
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
      rowHs="{[34 + 1 + (rowHeight ? rowHeight : 0) * (nRowsToShow - 1), -1]}"
      colWs="{[-1]}"
      minRowH="{0}">
      <div class="list-container">
        <TableView
          uid="seq-rec-table"
          rl="{seqRecListRL}"
          bind:activeRowKey="{activeRecordId}"
          bind:selectedRecordIds
          bind:rowHeight
          showCheckBoxes
          multiRowSelect
          showHeaderRow />
      </div>
      <div>
        {selectedColl ? selectedGroupUid + ' : ' + selectedColl + (activeRecordId ? ` : ${activeRecordId}` : '') : ''}
      </div>
    </ResizableGrid>
  </ResizableGrid>
{:else}
  <div style="margin: auto;">Database functionality not supported.</div>
{/if}

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
