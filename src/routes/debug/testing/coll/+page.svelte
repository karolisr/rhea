<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import TableView from '$lib/ui/views/TableView'
import { type Collection } from '$lib/types'
import ObjectTreeView from '$lib/ui/views/ObjectTreeView'
import type { IndexedUndefined } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { getCollections, deleteCollection } from '$lib/app/api/db/collections'

let dbs: Awaited<typeof databases>
let colId: string
let colObj: IndexedUndefined
let collections: Collection[]
$: collectionsRL = new RecordList<Collection>(collections ?? [], 'id')

$: {
  const objs: IndexedUndefined = {}
  collectionsRL.items.forEach((_) => {
    if (!(_.id in objs)) {
      objs[_.id] = {}
    }
    if (_.parent_id) {
      if (!(_.parent_id in objs)) objs[_.parent_id] = {}
      const parent = objs[_.parent_id] as IndexedUndefined
      parent[_.id] = _
    }
  })
  if ('ROOT' in objs) colObj = objs['ROOT'] as IndexedUndefined
}

onMount(async () => {
  dbs = await databases
  collections = await getCollections(
    '',
    false,
    $dbs.dbCollections,
    'collections'
  )
})

onDestroy(() => {})
</script>

{#if colObj}
  <ObjectTreeView expanded name="ROOT" bind:obj="{colObj}" />
{/if}

{#if dbs}
  <TableView
    uid="col"
    rl="{collectionsRL}"
    bind:activeRowKey="{colId}"
    onDeleteRow="{(id) => {
      deleteCollection(String(id), $dbs.dbCollections, 'collections')
    }}"
    showHeaderRow />
{/if}
