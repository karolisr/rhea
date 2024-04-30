<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import TableView from '$lib/ui/views/TableView'
import { type Collection } from '$lib/app/db/types'
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'
import ObjectTreeView from '$lib/ui/views/ObjectTreeView'
import type { IndexedUndefined } from '$lib/types'

let _db_main: Readable<DBMainSvelteStore>
let colId: string
let colObj: IndexedUndefined
let deleteCollection: typeof $_db_main.deleteCollection

$: collectionsRL = new RecordList<Collection>(
  _db_main ? $_db_main.collection : [],
  'id'
)

$: {
  const objs: IndexedUndefined = {}
  collectionsRL.items.forEach((_) => {
    if (!(_.id in objs)) {
      objs[_.id] = {}
    }
    let item = objs[_.id] as unknown as IndexedUndefined
    item['parentId'] = _.parentId
    item['label'] = _.label

    if (!(_.parentId in objs)) objs[_.parentId] = {}
    const parent = objs[_.parentId] as IndexedUndefined
    parent[_.id] = item
  })
  if ('ROOT' in objs) colObj = objs['ROOT'] as IndexedUndefined
}

onMount(async () => {
  _db_main = await db_main
  deleteCollection = $_db_main.deleteCollection
})

onDestroy(() => {})
</script>

{#if colObj}
  <ObjectTreeView expanded name="ROOT" bind:obj="{colObj}" />
{/if}

<TableView
  uid="col"
  rl="{collectionsRL}"
  bind:activeRowKey="{colId}"
  onDeleteRow="{deleteCollection}"
  showHeaderRow />
