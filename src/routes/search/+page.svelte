<script lang="ts">
import { onMount } from 'svelte'
import { Input, Button, ButtonGroup } from 'flowbite-svelte'
import { getTaxIDs, makeESearchTerm } from '$lib/ncbi/utils'
import { EntrezFilters, NCBIDatabase, type ESummaryNuccore } from '$lib/ncbi'
import { esearch, esummary } from '$lib/ncbi/eutils'

let searchTerm: string = ''
$: searchTermProcessed = searchTerm.trim()
let refSeqOnly = true
let searchButtonDisabled = true
let searching = false
let esummaryResult: ESummaryNuccore[] = []

async function validateSearchTerm(): Promise<void> {
  if (searchTermProcessed.length > 2) {
    searchButtonDisabled = false
  } else {
    searchButtonDisabled = true
  }
}

async function search(): Promise<void> {
  searching = true
  searchTerm = searchTermProcessed
  const taxids: number[] = await getTaxIDs(searchTerm)
  if (taxids.length > 0) {
    const term = makeESearchTerm(
      taxids,
      [...Object.values(EntrezFilters)],
      refSeqOnly
    )
    const esearchResult = await esearch(NCBIDatabase.nuccore, term, true)
    esummaryResult = (await esummary(esearchResult.params)) as ESummaryNuccore[]
    searching = false
  } else {
    searching = false
  }
}

onMount(() => {
  validateSearchTerm()
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
        size="lg"
        bind:value="{searchTerm}"
        on:input="{validateSearchTerm}"
        disabled="{searching}" />
      <!-- {#if searching} -->
      <!-- {:else} -->
      <Button
        type="submit"
        color="primary"
        size="lg"
        disabled="{searchButtonDisabled || searching}">Search</Button>
      <!-- {/if} -->
    </ButtonGroup>
  </form>
</div>

{#each esummaryResult as summ}
  <pre
    class="m-2 select-all border bg-lime-50 p-2">{summ.accessionversion} {summ.title}</pre>
{:else}
  <pre class="m-2 select-all border bg-red-50 p-2">No results yet</pre>
{/each}
