<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import CheckBox from '$lib/ui/components/CheckBox.svelte'
import IconError from '~icons/fa6-solid/circle-exclamation'
import { getSeqRecords, getTaxIds, makeESearchTerm } from '$lib/ncbi/utils'
import { EntrezFilters, NCBIDatabase, type ESummaryNuccore } from '$lib/ncbi'
import { esearch, esummary, efetch } from '$lib/ncbi/eutils'
import { EutilParams } from '$lib/ncbi/eutils-params'
import { type Collection } from '$lib/types'
import databases from '$lib/app/svelte-stores/databases'
import { getCollections, deleteCollection } from '$lib/app/api/db/collections'
import { insertGbSeqRecords } from '$lib/app/api/db/gbseq'
import { BROWSER } from '$lib/app/api'
// import { type Readable } from 'svelte/store'
// import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db/db-main'
// import db_main from '$lib/app/svelte-stores/db/db-main'
// let _db_main: Readable<DBMainSvelteStore>
let dbs: Awaited<typeof databases>

let searchTerm: string = ''
let searchStatusMessage: string = 'No results yet.'
$: updateStatus(searchStatusMessage)
$: searchTermProcessed = searchTerm.trim()
let refSeqOnly = true
let searchButtonDisabled = true
let searching = false

let gbseqRemaining: number = 0

let esummaryResult: ESummaryNuccore[] = []
import status from '$lib/app/svelte-stores/status'
import type { TaxaSet } from '$lib/ncbi/types/TaxaSet'
import type { GBSet } from '$lib/ncbi/types/GBSet'

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
  let taxids: number[] = await getTaxIds(searchTerm).catch((message) => {
    console.warn(message)
    errorMsg = message
    return []
  })
  if (taxids.length > 0) {
    const term = makeESearchTerm(taxids, [...Object.values(EntrezFilters)], refSeqOnly)
    // console.log(term)
    const esearchResult = await esearch(NCBIDatabase.nuccore, term, true)
    esummaryResult = (await esummary(esearchResult.params)) as ESummaryNuccore[]
    if (esummaryResult.length === 0) {
      searchStatusMessage = `No results for ${searchTerm}. TaxIDs: ${taxids.join(', ')}`
    } else {
      // ---------------------
      const accs: string[] = []
      esummaryResult.forEach((x) => {
        accs.push(x.accessionversion)
        taxids.push(x.taxid)
      })
      // ---------------------
      searching = false
      // ---------------------

      if (BROWSER === 'Tauri') {
        searchStatusMessage = `Downloading complete sequence records.`
        const gbRecSets: GBSet[] = []
        const nBatches = Math.min(accs.length, 10)
        const batchSize = Math.round(accs.length / nBatches)
        gbseqRemaining += accs.length
        searchStatusMessage = `Downloading complete sequence records. ${gbseqRemaining} remaining.`
        for (let i = 0; i < accs.length; i += batchSize) {
          const batch = accs.slice(i, i + batchSize)
          setTimeout(async () => {
            const gbsp = await getSeqRecords('nuccore', batch)
            gbRecSets.push(gbsp)
            // $_db_main.put(gbsp, 'gbseq')
            // await insertGbSeqRecords(gbsp)
            gbseqRemaining -= gbsp.length
            searchStatusMessage = `Downloading complete sequence records. ${gbseqRemaining} remaining.`
            if (gbseqRemaining === 0) {
              searchStatusMessage = `Storing complete sequence records.`
              for (let i = 0; i < gbRecSets.length; i++) {
                const gbRecSet = gbRecSets[i]
                await insertGbSeqRecords(gbRecSet)
              }
              searchStatusMessage = `Storing complete sequence records: done.`
            }
          }, Math.random() * 10000)
        }
        // ---------------------
        // searchStatusMessage = `Downloading taxonomy records.`
        // const p = new EutilParams()
        // p.db = 'taxonomy'
        // p.ids = taxids
        // p.retmode = 'xml'
        // const _ = (await efetch(p)) as TaxaSet[]
        // let taxa: TaxaSet = []
        // for (const taxaSet of _) {
        //   taxa = [...taxa, ...taxaSet]
        // }
        // $_db_main.put(taxa, 'taxon')
        // ---------------------
      }
    }
    searchStatusMessage = `${esummaryResult.length.toLocaleString()} result${esummaryResult.length !== 1 ? 's' : ''}`
    // $_db_main.put(esummaryResult, 'seq_nt_summ')
    searching = false
  } else {
    searchStatusMessage = `No TaxID hits for ${searchTerm}`
    searching = false
  }
}

onMount(async () => {
  // _db_main = await db_main
  dbs = await databases
  validateSearchTerm()
})

onDestroy(() => {
  $status.main = ''
})
</script>

<div class="padded">
  <form on:submit|preventDefault="{search}">
    <input
      id="search"
      type="text"
      placeholder="Species, Genus, Family, etc."
      spellcheck="false"
      autocomplete="off"
      required
      bind:value="{searchTerm}"
      on:input="{validateSearchTerm}"
      disabled="{searching}" />
    <input type="submit" value="{searching ? 'Searching' : 'Search'}" disabled="{searchButtonDisabled || searching}" />
  </form>
  <div>
    <CheckBox id="refseq-only" bind:checked="{refSeqOnly}" label="RefSeq Only?" />
  </div>
  {#if error}
    <div><IconError />{errorMsg}</div>
  {/if}

  <div>
    {#each esummaryResult as summ}
      <div>{summ.accessionversion} {summ.organism}</div>
    {/each}
  </div>
</div>
