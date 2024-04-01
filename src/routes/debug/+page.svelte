<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import Table from '$lib/app/ui/views/Table/Table.svelte'
import { type GBSeq } from '$lib/ncbi/types/GBSet'
import { type Taxon } from '$lib/ncbi/types/TaxaSet'
import { type ESummaryNuccore } from '$lib/ncbi'
import { ObjArray } from '$lib/obj'

import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Readable<DBMainSvelteStore>

// async function delete_db_main() {
//   _db_main = await db_main
//   await $_db_main.delete()
// }

let esummaries: ESummaryNuccore[]
$: esummaries = _db_main ? $_db_main.seq_nt_summ : []

let gbseqs: GBSeq[]
$: gbseqs = _db_main ? $_db_main.gbseq : []

let taxa: Taxon[]
$: taxa = _db_main ? $_db_main.taxon : []

onMount(async () => {
  _db_main = await db_main
})

onDestroy(() => {})
</script>

<!-- <button on:click="{delete_db_main}">Delete DBMain</button> -->

<!-- <Table data="{esummaries}" sortBy="{'uid'}" pageSize="{10}" /> -->
<!-- <Table
  data="{gbseqs}"
  fields="{['GBSeq_accession_version', 'GBSeq_length', 'GBSeq_definition']}"
  sortBy="{'GBSeq_length'}"
  pageSize="{10}" /> -->
<Table objArray="{new ObjArray(esummaries)}" sortBy="{'genome'}" pageSize="{10}" />
