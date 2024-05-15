<script lang="ts">
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import TreeView from '$lib/ui/views/TreeView'
import { onMount } from 'svelte'
import {
  createCollection,
  deleteCollection,
  relabelCollection
} from '$lib/app/api/db/collections'
import databases from '$lib/app/svelte-stores/databases'
let dbs: Awaited<typeof databases>

let selectedColl: string | undefined = undefined
let selectedSrch: string | undefined = undefined
let selectedTaxon: string | undefined = undefined

onMount(async () => {
  dbs = await databases
})
</script>

<ResizableGrid
  nRow="{1}"
  nCol="{2}"
  rowHs="{[-1]}"
  colWs="{[250, -1]}"
  minColW="{100}">
  {#if $dbs}
    <ResizableGrid
      nRow="{3}"
      nCol="{1}"
      rowHs="{[200, 100, -1]}"
      colWs="{[-1]}">
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
        uid="{'search-results-tree'}"
        expanded="{true}"
        db="{$dbs.dbCollections}"
        tableName="search_results"
        rootLabel="Search Results"
        bind:selected="{selectedSrch}"
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
    </ResizableGrid>
  {:else}
    <div>Loading...</div>
  {/if}

  <ResizableGrid
    nRow="{2}"
    nCol="{1}"
    rowHs="{[200, -1]}"
    colWs="{[-1]}"
    minRowH="{100}">
    <div>{selectedColl ?? ''}</div>
    <div>{selectedColl ? selectedColl + ': Selected Item' : ''}</div>
  </ResizableGrid>
</ResizableGrid>

<style lang="scss">
div {
  align-content: center;
  text-align: center;
  background-color: white;
}
</style>
