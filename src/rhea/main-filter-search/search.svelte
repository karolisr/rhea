<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { CheckBox } from '$lib/ui/form-elements'
import IconError from '~icons/fa6-solid/circle-exclamation'
import { getSeqRecords, getTaxIds, makeESearchTerm } from '$lib/ncbi/utils'
import {
  EntrezFiltersOrganelles,
  EntrezPropertiesBiomol,
  NCBIDatabase,
  type ESummaryNuccore
} from '$lib/ncbi'
import { esearch, esummary, efetch } from '$lib/ncbi/eutils'
import databases from '$lib/stores/databases'
import { appStatus } from '$lib/stores/status'
import searchStore from '$lib/stores/search-store'
import { TextInput } from '$lib/ui/form-elements'
import { NumberInput } from '$lib/ui/form-elements'
import { Button } from '$lib/ui/form-elements'
import { insertSeqSummaries } from '$lib/backend/db/summaries'
import { insertSeqRecs } from '$lib/backend/db/seqrecs'
import { gSysInfo } from '$lib/backend/system-info'
import type { GBSet } from '$lib/ncbi/types/GBSet'
import { getFontSize } from '$lib/utils'
import { Radio } from '$lib/ui/form-elements'
import { type Optional, type Mutable } from '$lib/types'
import { getPropNames } from '$lib/utils'

let gbseqRemaining: number = 0
let searchStatusMessage: string = 'No results yet.'

$: updateStatus(searchStatusMessage)

async function updateStatus(msg: string) {
  $appStatus.main = msg
}

let errorMsg: string = ''
$: error = errorMsg ? true : false

let dbs: Awaited<typeof databases>
let searchTerm: string = ''
$: searchTermProcessed = searchTerm.trim()
let refSeqOnly = true
let searchButtonDisabled = true
let searching = false

function validateSearchTerm() {
  if (
    !$searchStore.fresh &&
    searchMinLenValid &&
    searchMaxLenValid &&
    searchTermProcessed.length > 2
  ) {
    searchButtonDisabled = false
  } else {
    searchButtonDisabled = true
  }
}

async function search(): Promise<void> {
  $searchStore.results = []
  searching = true
  searchTerm = searchTermProcessed
  let taxids: number[] = await getTaxIds(searchTerm).catch((message) => {
    console.warn(message)
    errorMsg = message
    return []
  })
  if (taxids.length > 0) {
    const term = makeESearchTerm(
      taxids,
      selOrganelles,
      refSeqOnly,
      selBiomol,
      searchMinLen,
      searchMaxLen
    )
    const esearchResult = await esearch(NCBIDatabase.nuccore, term, true)
    $searchStore.results = (await esummary(
      esearchResult.params
    )) as ESummaryNuccore[]
    if ($searchStore.results.length === 0) {
      searchStatusMessage = `No results for ${searchTerm}. TaxIDs: ${taxids.join(', ')}`
    } else {
      // ---------------------
      // console.log($searchStore.results)
      const accs: string[] = []
      $searchStore.results.forEach((x) => {
        accs.push(x.accessionversion)
        taxids.push(x.taxid)
      })
      searchStatusMessage = `Storing summaries.`
      await insertSeqSummaries($searchStore.results, $dbs)
      searchStatusMessage = `Storing summaries: done.`
      // ---------------------
      searching = false
      // ---------------------

      // ---------------------
      searchStatusMessage = `Storing summaries.`
      await insertSeqSummaries($searchStore.results, $dbs)
      searchStatusMessage = `Storing summaries: done.`
      // ---------------------

      // ---------------------
      $searchStore.fresh = true
      // ---------------------

      if (gSysInfo.browser === 'Tauri') {
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
            gbseqRemaining -= gbsp.length
            searchStatusMessage = `Downloading complete sequence records. ${gbseqRemaining} remaining.`
            if (gbseqRemaining === 0) {
              searchStatusMessage = `Storing complete sequence records.`
              for (let i = 0; i < gbRecSets.length; i++) {
                const gbRecSet = gbRecSets[i]
                await insertSeqRecs(gbRecSet, $dbs, 'dbSeqRecs', 'dbSequences')
              }
              searchStatusMessage = `Storing complete sequence records: done.`
              const ev = new Event('seq-db-updated')
              dispatchEvent(ev)
            }
          }, Math.random() * 10000)
        }
      }
    }
    searchStatusMessage = `${$searchStore.results.length.toLocaleString()} result${$searchStore.results.length !== 1 ? 's' : ''}`
    searching = false
  } else {
    searchStatusMessage = `No TaxID hits for ${searchTerm}`
    searching = false
  }
}

onMount(async () => {
  dbs = await databases
  validateSearchTerm()
})

onDestroy(() => {
  $appStatus.main = ''
})

let searchMinLen: number = 1e3
let searchMaxLen: number = 1e7

let searchMinLenValid: boolean = true
let searchMaxLenValid: boolean = true

type OrganelleFlags = Mutable<{
  [key in keyof typeof EntrezFiltersOrganelles]: boolean
}>

let organelleOptions: OrganelleFlags = {
  plastid: true,
  chloroplast: true,
  mitochondrion: true
}

let selOrganelles: (keyof typeof EntrezFiltersOrganelles)[]

$: selOrganelles = getPropNames(organelleOptions).filter((k) => {
  const v = organelleOptions[k as keyof typeof EntrezFiltersOrganelles]
  if (v) return k
}) as (keyof typeof EntrezFiltersOrganelles)[]

type BiomolFlags = Mutable<{
  [key in keyof typeof EntrezPropertiesBiomol]: boolean
}>

let biomolOptions: BiomolFlags = {
  DNA: true,
  RNA: false,
  mRNA: false,
  rRNA: false,
  tRNA: false
}

let selBiomol: (keyof typeof EntrezPropertiesBiomol)[]

$: selBiomol = getPropNames(biomolOptions).filter((k) => {
  const v = biomolOptions[k as keyof typeof EntrezPropertiesBiomol]
  if (v) return k
}) as (keyof typeof EntrezPropertiesBiomol)[]

let organelleOptionsDisabled: boolean = false
let biomolOptionsDisabled: boolean = false

$: {
  if (
    new Set(selBiomol).intersection(new Set(['RNA', 'mRNA', 'rRNA', 'tRNA']))
      .size > 0
  ) {
    organelleOptionsDisabled = true
    organelleOptions.plastid = false
    organelleOptions.chloroplast = false
    organelleOptions.mitochondrion = false
  } else {
    organelleOptionsDisabled = false
  }
}

$: {
  if (selOrganelles.length > 0) {
    biomolOptionsDisabled = true
  } else {
    biomolOptionsDisabled = false
  }
}
</script>

{#if error}
  <div>
    <IconError />{errorMsg}
  </div>
{/if}

<form on:submit|preventDefault="{search}">
  <div class="form-grid">
    <div class="form-grid-item form-grid-item-1">
      <div>
        <TextInput
          id="searchTermInput"
          required="{true}"
          placeholder="{'Species, Genus, Family, etc.'}"
          bind:value="{searchTerm}"
          on:input="{validateSearchTerm}"
          disabled="{searching}" />

        <Button
          label="{searching ? 'Searching' : 'Search'}"
          disabled="{searchButtonDisabled || searching}"
          on:click="{search}" />
      </div>
    </div>
    <div class="form-grid-item form-grid-item-2">
      <div>
        <CheckBox
          id="pl"
          bind:disabled="{organelleOptionsDisabled}"
          bind:checked="{organelleOptions['plastid']}"
          label="Plastid" />
        <CheckBox
          id="cp"
          bind:disabled="{organelleOptionsDisabled}"
          bind:checked="{organelleOptions['chloroplast']}"
          label="Chloroplast" />
        <CheckBox
          id="mt"
          bind:disabled="{organelleOptionsDisabled}"
          bind:checked="{organelleOptions['mitochondrion']}"
          label="Mitochondrion" />
        <CheckBox
          id="refseq"
          bind:checked="{refSeqOnly}"
          label="RefSeq" />
      </div>
    </div>

    <div class="form-grid-item form-grid-item-3">
      <div>
        <CheckBox
          id="DNA"
          bind:disabled="{biomolOptionsDisabled}"
          bind:checked="{biomolOptions['DNA']}"
          label="DNA" />
        <CheckBox
          id="RNA"
          bind:disabled="{biomolOptionsDisabled}"
          bind:checked="{biomolOptions['RNA']}"
          label="RNA" />
        <CheckBox
          id="mRNA"
          bind:disabled="{biomolOptionsDisabled}"
          bind:checked="{biomolOptions['mRNA']}"
          label="mRNA" />
        <CheckBox
          id="rRNA"
          bind:disabled="{biomolOptionsDisabled}"
          bind:checked="{biomolOptions['rRNA']}"
          label="rRNA" />
        <CheckBox
          id="tRNA"
          bind:disabled="{biomolOptionsDisabled}"
          bind:checked="{biomolOptions['tRNA']}"
          label="tRNA" />
      </div>
    </div>
    <div class="form-grid-item form-grid-item-4">
      <div>
        <NumberInput
          id="searchMinLenInput"
          label="min"
          bind:value="{searchMinLen}"
          minVal="{0}"
          maxVal="{1e10}"
          step="{100}"
          on:input="{validateSearchTerm}"
          bind:valid="{searchMinLenValid}" />
        <NumberInput
          id="searchMaxLenInput"
          label="max"
          bind:value="{searchMaxLen}"
          minVal="{0}"
          maxVal="{1e10}"
          step="{100}"
          on:input="{validateSearchTerm}"
          bind:valid="{searchMaxLenValid}" />
      </div>
    </div>
  </div>
</form>

<style>
.form-grid {
  /* background-color: coral; */
  flex-grow: 1;
  margin-block-start: calc(var(--pad) * 2);
  /* margin-block-end: calc(var(--pad) * 2 + 1px); */
  margin-inline: calc(var(--pad) * 2);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: calc((var(--fs) * 2) - 1px);
  gap: calc(var(--pad) * 2);
}

.form-grid-item {
  /* background-color: blanchedalmond; */
  display: flex;
  /* border-style: solid; */
  /* border-radius: 5px; */
}

.form-grid-item-1 {
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 2;
  /* border-style: none; */
}

.form-grid-item-1 > div {
  flex-grow: 1;
  display: flex;
  gap: calc(var(--pad) * 2);
  /* margin-inline: 10%; */
}

.form-grid-item-2 {
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 6;
}

.form-grid-item-2 > div {
  margin-inline: auto;
  margin-block-start: calc(var(--pad) * 2);
}

.form-grid-item-3 {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 6;
}

.form-grid-item-3 > div {
  margin-inline: auto;
  margin-block-start: calc(var(--pad) * 2);
}

.form-grid-item-4 {
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 6;
}

.form-grid-item-4 > div {
  margin-inline: auto;
  margin-block-start: calc(var(--pad) * 1);
}
</style>
