<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { TreeView } from '$lib/ui/tree-view'
import { appState, saveAppState } from '$lib/stores/state'
import {
  createCollection,
  deleteCollection,
  relabelCollection
} from '$lib/backend/db/collections'
import databases from '$lib/stores/databases'
import { DocListMain } from '$lib/models/doc/doc-list-main'
// ----------------------------------------------------------------------------

let dbs: Awaited<typeof databases>

onMount(async () => {
  dbs = await databases
})

onDestroy(async () => {})

export let docListMain: DocListMain

export let selCollGrp =
  ($appState.selCollGrp as string | undefined) || 'coll-db-all-recs'
export let selColl = ($appState.selColl as string | undefined) || 'ROOT'

export let collRebuildSrch: number
export let expCollsSrch = $appState.expCollsSrch as Set<string> | undefined

let selMolType = ($appState.selMolType as string | undefined) || 'ROOT'
let selOrgnell = ($appState.selOrgnell as string | undefined) || 'ROOT'
let selOther = ($appState.selOther as string | undefined) || 'ROOT'

let expCollsUsr = $appState.expCollsUsr as Set<string> | undefined
let expCollsMolType = $appState.expCollsMolType as Set<string> | undefined
let expCollsOrgnell = $appState.expCollsOrgnell as Set<string> | undefined
let expCollsOther = $appState.expCollsOther as Set<string> | undefined

$: {
  $appState.selCollGrp = selCollGrp
  $appState.selColl = selColl
  $appState.selMolType = selMolType
  $appState.selOrgnell = selOrgnell
  $appState.selOther = selOther
  $appState.expCollsUsr = expCollsUsr
  $appState.expCollsSrch = expCollsSrch
  $appState.expCollsMolType = expCollsMolType
  $appState.expCollsOrgnell = expCollsOrgnell
  $appState.expCollsOther = expCollsOther
  saveAppState()
}

export let selMolTypes: string[] = []
let _selMolTypes: string[] = []
$: {
  const prev = new Set(selMolTypes)
  const curr = new Set(_selMolTypes)
  if (prev.symmetricDifference(curr).size !== 0) {
    selMolTypes = _selMolTypes
  }
}

export let selOrgnells: string[] = []
let _selOrgnells: string[] = []
$: {
  const prev = new Set(selOrgnells)
  const curr = new Set(_selOrgnells)
  if (prev.symmetricDifference(curr).size !== 0) {
    selOrgnells = _selOrgnells
  }
}

export let selOthers: string[] = []
let _selOthers: string[] = []
$: {
  const prev = new Set(selOthers)
  const curr = new Set(_selOthers)
  if (prev.symmetricDifference(curr).size !== 0) {
    selOthers = _selOthers
  }
}

export let selCollsSrch: string[] | undefined
let _selCollsSrch: string[] = []
$: {
  const prev = new Set(selCollsSrch)
  const curr = new Set(_selCollsSrch)
  if (prev.symmetricDifference(curr).size !== 0) {
    selCollsSrch = _selCollsSrch
  }
}
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
      contextMenuEnabled="{true}"
      createNodeEnabled="{true}"
      deleteNodeEnabled="{true}"
      relabelNodeEnabled="{true}"
      createNode="{createCollection}"
      deleteNode="{deleteCollection}"
      relabelNode="{relabelCollection}"
      acceptedDropTypes="{['acc-ver-array']}"
      addRecords="{docListMain.addToColl.bind(docListMain)}" />

    <TreeView
      uid="{'coll-search-results'}"
      rootLabel="Sequence Search"
      tableName="search_results"
      db="{$dbs.dbCollections}"
      expanded="{false}"
      bind:selected="{selColl}"
      bind:selectedGroupUid="{selCollGrp}"
      bind:expandedIds="{expCollsSrch}"
      bind:rebuild="{collRebuildSrch}"
      contextMenuEnabled="{true}"
      createNodeEnabled="{false}"
      deleteNodeEnabled="{true}"
      relabelNodeEnabled="{true}"
      createNode="{createCollection}"
      deleteNode="{deleteCollection}"
      relabelNode="{relabelCollection}"
      bind:selectedChildIds="{_selCollsSrch}"
      selectedChildIdsEnabled />

    <TreeView
      uid="{'coll-db-all-recs'}"
      rootLabel="All Records"
      tableName="all_records"
      db="{$dbs.dbCollections}"
      expanded="{false}"
      bind:selected="{selColl}"
      bind:selectedGroupUid="{selCollGrp}"
      selectedChildIdsEnabled />

    <div style="background-color: #CCC; height: 1px; margin-block-start: 3px;">
    </div>

    <TreeView
      uid="{'coll-cat-moltype'}"
      rootLabel="All Molecule Types"
      tableName="cat_moltype"
      db="{$dbs.dbCollections}"
      expanded="{false}"
      bind:selected="{selMolType}"
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
      bind:expandedIds="{expCollsOther}"
      bind:selectedChildIds="{_selOthers}"
      selectedChildIdsEnabled />
  </div>
{:else}
  <div>Loading...</div>
{/if}
