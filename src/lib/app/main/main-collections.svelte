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

// ---------------------------------------------------------------------------
export let selMolTypes: string[] = []
let _selMolTypes: string[] = []
$: {
  const prev = new Set(selMolTypes)
  const curr = new Set(_selMolTypes)
  if (prev.difference(curr).size !== 0 || curr.difference(prev).size !== 0) {
    selMolTypes = _selMolTypes
  }
}

export let selOrgnells: string[] = []
let _selOrgnells: string[] = []
$: {
  const prev = new Set(selOrgnells)
  const curr = new Set(_selOrgnells)
  if (prev.difference(curr).size !== 0 || curr.difference(prev).size !== 0) {
    selOrgnells = _selOrgnells
  }
}

export let selOthers: string[] = []
let _selOthers: string[] = []
$: {
  const prev = new Set(selOthers)
  const curr = new Set(_selOthers)
  if (prev.difference(curr).size !== 0 || curr.difference(prev).size !== 0) {
    selOthers = _selOthers
  }
}
// ---------------------------------------------------------------------------

// Collections state ---------------------------------------------------------
export let selCollGrp = $state.selCollGrp as string | undefined
export let selColl = $state.selColl as string | undefined

let selMolType = $state.selMolType as string | undefined
let selOrgnell = $state.selOrgnell as string | undefined
let selOther = $state.selOther as string | undefined

let expCollsUsr = $state.expCollsUsr as Set<string> | undefined
let expCollsMolType = $state.expCollsMolType as Set<string> | undefined
let expCollsOrgnell = $state.expCollsOrgnell as Set<string> | undefined
let expCollsOther = $state.expCollsOther as Set<string> | undefined

let rebuildTagCollsUsr: number

$: {
  $state.selCollGrp = selCollGrp
  $state.selColl = selColl

  $state.selMolType = selMolType
  $state.selOrgnell = selOrgnell
  $state.selOther = selOther

  $state.expCollsUsr = expCollsUsr
  $state.expCollsMolType = expCollsMolType
  $state.expCollsOrgnell = expCollsOrgnell
  $state.expCollsOther = expCollsOther
  saveState()
}
// Collections state END -----------------------------------------------------
</script>

{#if $dbs && $dbs.dbsOK && $dbs.dbCollections}
  <div class="grid-left-tree">
    <TreeView
      uid="{'coll-user'}"
      rootLabel="Collections"
      tableName="user"
      db="{$dbs.dbCollections}"
      expanded="{true}"
      bind:selected="{selColl}"
      bind:selectedGroupUid="{selCollGrp}"
      bind:expandedIds="{expCollsUsr}"
      bind:rebuild="{rebuildTagCollsUsr}"
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
      uid="{'coll-search-results'}"
      rootLabel="Sequence Search"
      tableName="search_results"
      db="{$dbs.dbCollections}"
      expanded="{true}"
      bind:selected="{selColl}"
      bind:selectedGroupUid="{selCollGrp}"
      createNode="{createCollection}"
      deleteNode="{deleteCollection}"
      relabelNode="{relabelCollection}" />

    <TreeView
      uid="{'coll-cat-moltype'}"
      rootLabel="All Molecule Types"
      tableName="cat_moltype"
      db="{$dbs.dbCollections}"
      expanded="{false}"
      bind:selected="{selMolType}"
      selectedGroupUid="{'coll-cat-moltype'}"
      bind:expandedIds="{expCollsMolType}"
      bind:selectedChildIds="{_selMolTypes}"
      selectedChildIdsEnabled />

    <TreeView
      uid="{'coll-cat-organelle'}"
      rootLabel="All Organelles"
      tableName="cat_organelle"
      db="{$dbs.dbCollections}"
      expanded="{false}"
      bind:selected="{selOrgnell}"
      selectedGroupUid="{'coll-cat-organelle'}"
      bind:expandedIds="{expCollsOrgnell}"
      bind:selectedChildIds="{_selOrgnells}"
      selectedChildIdsEnabled />

    <TreeView
      uid="{'coll-cat-other'}"
      rootLabel="All Other"
      tableName="cat_other"
      db="{$dbs.dbCollections}"
      expanded="{false}"
      bind:selected="{selOther}"
      selectedGroupUid="{'coll-cat-other'}"
      bind:expandedIds="{expCollsOther}"
      bind:selectedChildIds="{_selOthers}"
      selectedChildIdsEnabled />
  </div>
{:else}
  <div>Loading...</div>
{/if}
