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
  <ResizableGrid nRow="{1}" nCol="{1}" rowHs="{[-1]}" colWs="{[-1]}">
    {#if $dbs}
      <TreeView
        uid="{'collections-tree'}"
        expanded="{true}"
        db="{$dbs.dbCollections}"
        tableName="collections"
        bind:selected="{selectedColl}"
        createNode="{createCollection}"
        deleteNode="{deleteCollection}"
        relabelNode="{relabelCollection}" />
    {:else}
      <div>Loading...</div>
    {/if}
  </ResizableGrid>

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
