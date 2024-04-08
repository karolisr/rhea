<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import TableView from '$lib/ui/views/TableView'
import { type GBSeq } from '$lib/ncbi/types/GBSet'
import { type ESummaryNuccore } from '$lib/ncbi'
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

$: gbseqsRL = _db_main ? new RecordList<GBSeq>(_db_main, 'gbseq') : undefined
$: {
  if (gbseqsRL) {
    gbseqsRL.fieldsToShow = [
      'GBSeq_accession_version',
      'GBSeq_definition',
      'GBSeq_organism'
    ]
    gbseqsRL.sortBy(['GBSeq_accession_version'], [1])
  }
}

$: taxaRL = _db_main ? new RecordList<Taxon>(_db_main, 'taxon') : undefined
$: {
  if (taxaRL) {
    taxaRL.fieldsToShow = ['ScientificName', 'ParentTaxId', 'TaxId', 'PubDate']
    taxaRL.sortBy(['ScientificName', 'Lineage', 'ParentTaxId'], [-1, 1, 1])
  }
}

$: esummariesRL = _db_main
  ? new RecordList<ESummaryNuccore>(_db_main, 'seq_nt_summ')
  : undefined
$: {
  if (esummariesRL) {
    esummariesRL.fieldsToShow = [
      'accessionversion',
      'genome',
      'organism',
      'taxid'
    ]
    esummariesRL.sortBy(['genome', 'organism', 'accessionversion'], [-1, 1, 1])
  }
}

onMount(async () => {
  _db_main = await db_main
})

onDestroy(() => {})
</script>

{#if taxaRL}
  <TableView uid="tax" rl="{taxaRL}" />
{/if}

{#if gbseqsRL}
  <TableView uid="gbs" rl="{gbseqsRL}" />
{/if}

{#if esummariesRL}
  <TableView uid="esm" rl="{esummariesRL}" />
{/if}
