<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import TableView from '$lib/ui/views/TableView'
import { type GBSeq } from '$lib/ncbi/types/GBSet'
// import { type ESummaryNuccore } from '$lib/ncbi'
import { type Taxon } from '$lib/ncbi/types/TaxaSet'
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Readable<DBMainSvelteStore>

// async function delete_db_main() {
//   _db_main = await db_main
//   await $_db_main.delete()
// }

// let esummaries: ESummaryNuccore[]
// $: esummaries = _db_main ? $_db_main.seq_nt_summ : []

let gbseqs: GBSeq[]
$: gbseqs = _db_main ? $_db_main.gbseq : []
let gbseqsRL: RecordList<GBSeq>
$: {
  gbseqsRL = new RecordList(gbseqs)
  gbseqsRL.fieldsToShow = [
    'GBSeq_accession_version',
    'GBSeq_definition',
    'GBSeq_organism'
  ]
  gbseqsRL.sortBy(['GBSeq_accession_version'], [1])
}

let taxa: Taxon[]
$: taxa = _db_main ? $_db_main.taxon : []
let taxaRL: RecordList<Taxon>
$: {
  taxaRL = new RecordList(taxa)
  taxaRL.fieldsToShow = ['ScientificName', 'ParentTaxId', 'TaxId', 'PubDate']
  taxaRL.sortBy(['ScientificName', 'Lineage', 'ParentTaxId'], [-1, 1, 1])
}

onMount(async () => {
  _db_main = await db_main
})

onDestroy(() => {})
</script>

<TableView uid="tax" rl="{taxaRL}" />
<!-- <TableView uid="gbs" rl="{gbseqsRL}" /> -->
