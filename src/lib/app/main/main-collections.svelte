<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import TreeView from '$lib/ui/views/TreeView'
import state, { saveState } from '$lib/svelte-stores/state'
import {
  createCollection,
  deleteCollection,
  relabelCollection
} from '$lib/api/db/collections'

import {
  addSeqRecsToCollection,
  removeSeqRecsFromCollection
} from '$lib/api/db/gbseq'

import databases from '$lib/svelte-stores/databases'

// ---------------------------------------------------------------------------

let dbs: Awaited<typeof databases>

// ---------------------------------------------------------------------------
onMount(async () => {
  dbs = await databases
})

onDestroy(async () => {})
// ---------------------------------------------------------------------------

// Collections / State -------------------------------------------------------
export let selectedCollGroup = $state.selectedCollGroup as string | undefined
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

{#if $dbs && $dbs.dbsOK && $dbs.dbCollections}
  <!-- <ResizableGrid
    nRow="{1}"
    nCol="{1}"
    rowHs="{[-1]}"
    colWs="{[-1]}"
    minRowH="{0}"
    enforceMaxSize="{false}"> -->
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
  <!-- </ResizableGrid> -->
{:else}
  <div>Loading...</div>
{/if}
