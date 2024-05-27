<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import TableView from '$lib/ui/views/TableView'
import { type Collection } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { getCollections, deleteCollection } from '$lib/app/api/db/collections'

let dbs: Awaited<typeof databases>
let colId: string
let collections: Collection[]
$: collectionsRL = new RecordList<Collection>(collections ?? [], 'id')
$: if (collectionsRL) {
  collectionsRL.fieldsToShow = ['label', 'id', 'parent_id']
}

onMount(async () => {
  dbs = await databases
  collections = await getCollections([], false, $dbs.dbCollections, 'user')
})

onDestroy(() => {})
</script>

{#if dbs && $dbs.dbCollections}
  <TableView
    uid="col"
    rl="{collectionsRL}"
    minColW="{50}"
    bind:activeRowKey="{colId}"
    onDeleteRow="{(id) => {
      deleteCollection(String(id), $dbs.dbCollections, 'user')
    }}"
    showHeaderRow />
{:else}
  <div style="margin: auto;">Database functionality not supported.</div>
{/if}
