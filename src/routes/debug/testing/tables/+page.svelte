<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { RecordList } from '$lib/utils/record-list'
import ResizableGrid from '$lib/ui/views/ResizableGrid/ResizableGrid.svelte'
import TableView from '$lib/ui/views/TableView'
import { type GBSeq } from '$lib/ncbi/types/GBSet'
import { type ESummaryNuccore } from '$lib/ncbi'
import { type Taxon } from '$lib/ncbi/types/TaxaSet'
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Readable<DBMainSvelteStore>

let taxid: number
let taxon: Taxon
let accver: string

$: taxaRL = new RecordList<Taxon>(_db_main ? $_db_main.taxon : [], 'TaxId')
$: {
  if (taxaRL) {
    taxaRL.fieldsToShow = taxaRL.fieldsByType(['string', 'number', 'boolean'])
    taxaRL.sortBy(['Lineage', 'ScientificName', 'ParentTaxId'], [1, 1, 1])
  }
}
$: lineageRL = new RecordList<Taxon>(
  taxon && taxon.LineageEx ? taxon.LineageEx : [],
  'TaxId'
)

$: esummariesRL = new RecordList<ESummaryNuccore>(
  _db_main ? $_db_main.seq_nt_summ : [],
  'accessionversion'
)
$: {
  esummariesRL.fieldsToShow = esummariesRL.fieldsByType([
    'string',
    'number',
    'boolean'
  ])
  esummariesRL.filterBy('taxid', taxid)
  esummariesRL.sortBy(['genome', 'organism', 'accessionversion'], [-1, 1, 1])
  esummariesRL = esummariesRL
}

let gbseqsRL: RecordList<GBSeq>

$: gbseqsRL = new RecordList<GBSeq>(
  _db_main ? $_db_main.gbseq : [],
  'GBSeq_accession_version'
)
$: {
  gbseqsRL.fieldsToShow = gbseqsRL
    .fieldsByType(['string', 'number', 'boolean'])
    .filter((v) => v !== 'GBSeq_sequence')
  gbseqsRL.filterBy('GBSeq_organism', taxon ? taxon.ScientificName : '')
  gbseqsRL.sortBy(['GBSeq_accession_version'], [1])
  gbseqsRL = gbseqsRL
}

onMount(async () => {
  _db_main = await db_main
})

onDestroy(() => {})
</script>

<ResizableGrid nRow="{1}" nCol="{2}" rowHs="{[-1]}" colWs="{[750, -1]}">
  <ResizableGrid nRow="{3}" nCol="{1}" rowHs="{[500, 100, -1]}" colWs="{[-1]}">
    <TableView
      uid="tax"
      rl="{taxaRL}"
      bind:activeRowKey="{taxid}"
      bind:activeRowRecord="{taxon}"
      multiRowSelect
      showCheckBoxes
      showHeaderRow />

    <TableView
      uid="esm"
      rl="{esummariesRL}"
      bind:activeRowKey="{accver}"
      showHeaderRow />

    <TableView uid="gbs" rl="{gbseqsRL}" showHeaderRow />
  </ResizableGrid>
  <TableView uid="lin" rl="{lineageRL}" showHeaderRow />
</ResizableGrid>
