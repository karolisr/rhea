<script lang="ts">
// import TableDTDs from '$lib/app/ui/views/TableDTDs.svelte'
import TableSeqSum from '$lib/app/ui/views/TableSeqSum.svelte'
// import TableGBSeqs from '$lib/app/ui/views/TableGBSeqs.svelte'
// import TableTaxSumm from '$lib/app/ui/views/TableTaxSumm.svelte'

import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'
let _db_main: Readable<DBMainSvelteStore>

async function delete_db_main() {
  _db_main = await db_main
  await $_db_main.delete()
}
</script>

<!-- <div><button on:click="{delete_db_main}">Delete DBMain</button></div> -->

<!-- <TableDTDs /> -->
<!-- <TableTaxSumm /> -->
<TableSeqSum />
<!-- <TableGBSeqs /> -->
