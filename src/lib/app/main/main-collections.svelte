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

// Collections state ---------------------------------------------------------
export let selectedCollGroup = $state.selectedCollGroup as string | undefined
export let selectedColl = $state.selectedColl as string | undefined
let expndUserCollIds = $state.expndUserCollIds as Set<string> | undefined
let expndSeqCatCollIds = $state.expndSeqCatCollIds as Set<string> | undefined

$: {
  $state.selectedCollGroup = selectedCollGroup
  $state.selectedColl = selectedColl
  $state.expndUserCollIds = expndUserCollIds
  $state.expndSeqCatCollIds = expndSeqCatCollIds
  saveState()
}

let userCollRebuildTag: number
// Collections state END -----------------------------------------------------

export let selectedSeqCategories: string[] = []
let _ssc: string[] = []

$: {
  const prev = new Set(selectedSeqCategories)
  const curr = new Set(_ssc)
  if (prev.difference(curr).size !== 0 || curr.difference(prev).size !== 0) {
    selectedSeqCategories = _ssc
  }
}
</script>

{#if $dbs && $dbs.dbsOK && $dbs.dbCollections}
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
      bind:selectedChildIds="{_ssc}"
      selectedChildIdsEnabled />
  </div>
{:else}
  <div>Loading...</div>
{/if}
