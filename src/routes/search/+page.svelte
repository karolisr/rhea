<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Input, Button, ButtonGroup, Alert, Spinner } from 'flowbite-svelte'
import { fade } from 'svelte/transition'
import IconError from '~icons/fa6-solid/circle-exclamation'
import { getSeqRecords, getTaxIDs, makeESearchTerm } from '$lib/ncbi/utils'
import {
  EntrezFilters,
  NCBIDatabase,
  type ESummaryNuccore,
  type ESummaryTaxonomy
} from '$lib/ncbi'
import { esearch, esummary, efetch } from '$lib/ncbi/eutils'
import { EutilParams } from '$lib/ncbi/eutils-params'

import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'
let _db_main: Readable<DBMainSvelteStore>

let searchTerm: string = ''
let searchStatusMessage: string = 'No results yet.'
$: updateStatus(searchStatusMessage)
$: searchTermProcessed = searchTerm.trim()
let refSeqOnly = true
let searchButtonDisabled = true
let searching = false

let esummaryResult: ESummaryNuccore[] = []
import status from '$lib/app/svelte-stores/status'

let errorMsg: string = ''
$: error = errorMsg ? true : false

function validateSearchTerm() {
  if (searchTermProcessed.length > 2) {
    searchButtonDisabled = false
  } else {
    searchButtonDisabled = true
  }
}

async function updateStatus(msg: string) {
  $status.main = msg
}

async function search(): Promise<void> {
  searching = true
  searchTerm = searchTermProcessed
  const taxids: number[] = await getTaxIDs(searchTerm).catch((message) => {
    console.warn(message)
    errorMsg = message
    return []
  })
  if (taxids.length > 0) {
    const term = makeESearchTerm(
      taxids,
      [...Object.values(EntrezFilters)],
      refSeqOnly
    )
    const esearchResult = await esearch(NCBIDatabase.nuccore, term, true)
    esummaryResult = (await esummary(esearchResult.params)) as ESummaryNuccore[]
    if (esummaryResult.length === 0) {
      searchStatusMessage = `No results for ${searchTerm}. TaxIDs: ${taxids.join(', ')}`
    } else {
      // ---------------------
      const accs: string[] = []
      esummaryResult.forEach((x) => {
        accs.push(x.accessionversion)
      })
      // ---------------------
      searching = false
      searchStatusMessage = `Downloading complete sequence records.`
      // ---------------------
      const gbseqs = await getSeqRecords('nuccore', accs)
      $_db_main.put(gbseqs, 'gbseq')
      // ---------------------
      searchStatusMessage = `Downloading taxonomy records.`
      // ---------------------
      const p = new EutilParams()
      p.db = 'taxonomy'
      p.ids = taxids
      const tax_summs = (await esummary(p)) as ESummaryTaxonomy[]
      $_db_main.put(tax_summs, 'tax_summ')
      // ---------------------
      // const p = new EutilParams()
      // p.db = 'taxonomy'
      // p.ids = taxids
      // p.retmode = 'xml'
      // const tax_summs = (await efetch(p)) as { Taxon: ESummaryTaxonomy[] }
      // ---------------------
    }
    searchStatusMessage = `${esummaryResult.length.toLocaleString()} results`
    $_db_main.put(esummaryResult, 'seq_nt_summ')
    searching = false
  } else {
    searchStatusMessage = `No TaxID hits for ${searchTerm}`
    searching = false
  }
}

onMount(async () => {
  _db_main = await db_main
  validateSearchTerm()
})

onDestroy(() => {
  // $status.main = ''
})
</script>

<div class="grid gap-6 p-5 md:grid-cols-1">
  <form on:submit|preventDefault="{search}">
    <ButtonGroup class="w-full">
      <Input
        type="search"
        id="gsearch"
        placeholder="Species, Genus, Family, etc."
        spellcheck="false"
        autocomplete="off"
        required
        bind:value="{searchTerm}"
        on:input="{validateSearchTerm}"
        disabled="{searching}"
        class="block w-full disabled:bg-opacity-75 rtl:text-right" />
      <Button
        type="submit"
        color="primary"
        disabled="{searchButtonDisabled || searching}"
        class="disabled:cursor-default disabled:hover:bg-primary-700">
        {#if searching}
          <Spinner color="white" size="4" class="mr-1" />Searching
        {:else}
          Search
        {/if}
      </Button>
    </ButtonGroup>
  </form>
  {#if error}
    <div
      in:fade
      out:fade
      class="absolute bottom-auto left-32 right-32 top-20 z-10 w-auto cursor-default">
      <Alert
        class="cursor-default shadow"
        border
        color="red"
        dismissable
        on:close="{() => {
          errorMsg = ''
        }}">
        <IconError slot="icon" class="h-4 w-4" />
        {errorMsg}
      </Alert>
    </div>
  {/if}
</div>

<div class="px-4">
  {#each esummaryResult as summ}
    <pre
      class="
            m-2
            select-all
            rounded-md
            border
            border-neutral-300
            bg-lime-50 p-2
            ">{summ.accessionversion} {summ.organism}</pre>
  {/each}
</div>
