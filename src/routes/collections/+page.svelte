<script lang="ts">
import type { Readable } from 'svelte/store'
// import type { DBMainSvelteStore } from '$lib/app/svelte-stores/db/db-main'
import ResizableGrid from '$lib/ui/views/ResizableGrid'
import TreeView from '$lib/ui/views/TreeView'
// import db_main from '$lib/app/svelte-stores/db/db-main'
import { onMount } from 'svelte'
import { getCollections, createCollection, deleteCollection, relabelCollection } from '$lib/app/api/db/collections'

// let _db_main: Readable<DBMainSvelteStore>
let selectedColl: string | undefined = undefined

onMount(async () => {
  // _db_main = await db_main
})
</script>

<ResizableGrid
  nRow="{1}"
  nCol="{2}"
  rowHs="{[-1]}"
  colWs="{[250, -1]}"
  minColW="{100}">
  <ResizableGrid nRow="{1}" nCol="{1}" rowHs="{[-1]}" colWs="{[-1]}">
    <!-- {#if $_db_main} -->
      <TreeView
        uid="{'collections-tree'}"
        expanded="{true}"
        bind:selected="{selectedColl}"
        createNode="{createCollection}"
        deleteNode="{deleteCollection}"
        relabelNode="{relabelCollection}"
        />
    <!-- {:else}
      <div>Loading...</div>
    {/if} -->
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
