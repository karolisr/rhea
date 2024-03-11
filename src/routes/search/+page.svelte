<script lang="ts">
import { onMount } from 'svelte'
import { Input, Button, ButtonGroup, Alert, Spinner } from 'flowbite-svelte'
import { fade } from 'svelte/transition'
import IconError from '~icons/fa6-solid/circle-exclamation'
import { getTaxIDs, makeESearchTerm } from '$lib/ncbi/utils'
import { EntrezFilters, NCBIDatabase, type ESummaryNuccore } from '$lib/ncbi'
import { esearch, esummary } from '$lib/ncbi/eutils'
import { db_init, db_delete } from '$lib/app/db'
import { type DBMain } from '$lib/app/db/types'
import { type IDBPDatabase } from 'idb'

let db: IDBPDatabase<DBMain>
let searchTerm: string = ''
$: searchTermProcessed = searchTerm.trim()
let refSeqOnly = true
let searchButtonDisabled = true
let searching = false
let esummaryResult: ESummaryNuccore[] = []
let errorMsg: string = ''
$: error = errorMsg ? true : false

async function validateSearchTerm(): Promise<void> {
  if (searchTermProcessed.length > 2) {
    searchButtonDisabled = false
  } else {
    searchButtonDisabled = true
  }
}

// async function add_to_db(summs: ESummaryNuccore[]) {
//   const tx = db.transaction('nt', 'readwrite')
//   await Promise.all([
//     ...summs.map((s) => {
//       tx.store.put(s)
//     }),
//     tx.done
//   ])
// }

async function search(): Promise<void> {
  searching = true
  searchTerm = searchTermProcessed
  const taxids: number[] = await getTaxIDs(searchTerm).catch((message) => {
    console.log(message)
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
    // add_to_db(esummaryResult)
    searching = false
  } else {
    searching = false
  }
}

onMount(async () => {
  validateSearchTerm()
  // db_delete()
  db = await db_init()
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
        disabled="{searching}" />
      <Button
        type="submit"
        color="primary"
        disabled="{searchButtonDisabled || searching}">
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
  {:else}
    <pre
      class="
            p-2
            m-2
            rounded-md
            border
            border-neutral-300
            select-all
            bg-red-50
            ">No results yet</pre>
  {/each}
</div>
