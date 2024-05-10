<script lang="ts">
import { type Readable } from 'svelte/store'
// import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
// import db_main from '$lib/app/svelte-stores/db-main'
import { onMount } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
// import type { DBMain } from '$lib/app/db/types'
import type { StoreNames, StoreValue } from 'idb'
import TableView from '$lib/ui/views/TableView'
import type { IndexedUndefined } from '$lib/types'
import ResizableGrid from '$lib/ui/views/ResizableGrid'

// type KeyToKeyNoIndex<T> = {
//   [K in keyof T]: string extends K ? never : number extends K ? never : K
// }
// type ValuesOf<T> = T extends { [K in keyof T]: infer U } ? U : never
// type KnownKeys<T> = ValuesOf<KeyToKeyNoIndex<T>>

// interface _StoreNames extends IndexedUndefined {
//   storeName: StoreNames<DBMain>
// }

// let _db_main: Readable<DBMainSvelteStore>
// let _storeNames: _StoreNames[] = []
// let selectedStoreName: string
// let selectedStoreKeyVal: string

// async function delete_db_main() {
//   _db_main = await db_main
//   await $_db_main.deleteDb()
// }

onMount(async () => {
  // _db_main = await db_main
  // const storeNameArray = [
  //   ...$_db_main.db.objectStoreNames
  // ] as StoreNames<DBMain>[]
  // for (let i = 0; i < storeNameArray.length; i++) {
  //   const sn = storeNameArray[i]
  //   _storeNames.push({ storeName: sn })
  // }
})

// $: storeNames = new RecordList<_StoreNames>(
//   _db_main ? _storeNames : [],
//   'storeName'
// )

// $: console.log(
//   selectedStoreName,
//   selectedStoreKeyVal,
//   _db_main ? $_db_main.keys[selectedStoreName] : ''
// )
// $: selectedStore = selectedStoreName
//   ? $_db_main[selectedStoreName as StoreNames<DBMain>]
//   : undefined
// $: storeRL = selectedStore
//   ? new RecordList<(typeof selectedStore)[0]>(
//       selectedStore,
//       $_db_main.keys[selectedStoreName] as KnownKeys<(typeof selectedStore)[0]>
//     )
//   : undefined
</script>

<!--
<div class="padded">
  <button class="danger" on:click="{delete_db_main}">Delete DB</button>
</div>
-->

<ResizableGrid nRow="{1}" nCol="{2}" rowHs="{[-1]}" colWs="{[100, -1]}">
  <!-- <TableView
    uid="store-names"
    rl="{storeNames}"
    bind:activeRowKey="{selectedStoreName}"
    showHeaderRow /> -->

  <!-- {#if storeRL}
    {#key storeRL}
      <TableView
        uid="elected-store"
        rl="{storeRL}"
        bind:activeRowKey="{selectedStoreKeyVal}"
        showHeaderRow />
    {/key}
  {/if} -->
</ResizableGrid>
