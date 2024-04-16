<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import TableView from '$lib/ui/views/TableView'
import { type Collection } from '$lib/app/db/types'
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Readable<DBMainSvelteStore>
let colId: string

$: collectionsRL = new RecordList<Collection>(
  _db_main ? $_db_main.collection : [],
  'id'
)

onMount(async () => {
  _db_main = await db_main
  $_db_main.put(
    [{ id: 'ROOT', parentId: 'NONE', label: 'ROOT', notes: '' }],
    'collection'
  )
  $_db_main.put(
    [
      {
        id: 'col01',
        parentId: 'ROOT',
        label: 'col01label',
        notes: 'col01notes'
      }
    ],
    'collection'
  )
})

onDestroy(() => {})
</script>

<TableView
  uid="col"
  rl="{collectionsRL}"
  bind:activeRowKey="{colId}"
  showHeaderRow />
