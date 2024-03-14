<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Tabs, TabItem } from 'flowbite-svelte'
import { fileDropListener } from '$lib/app/api/filedrop'
import TableDTDs from './TableDTDs.svelte'
import TableSeqSum1 from './TableSeqSum1.svelte'
import TableSeqSum2 from './TableSeqSum2.svelte'
import TableGbSeqs from './TableGBSeqs.svelte'
import TableTaxSumm from './TableTaxSumm.svelte'

let fileDropUnListener: () => void

const tabClassActive = `-mb-0.5 px-1 rounded-t-md border border-solid
   border-neutral-200 text-primary-600 border-b-white bg-white`

const tabClassInactive = `-mb-0.5 px-1 rounded-t-md border border-solid
   border-neutral-200 text-neutral-500 bg-neutral-100 hover:text-neutral-600
   hover:bg-neutral-50`

onMount(async () => {
  fileDropUnListener = await fileDropListener()
})

onDestroy(() => {
  if (fileDropUnListener !== undefined) {
    fileDropUnListener()
  }
})
</script>

<Tabs
  divider="{true}"
  class="flex flex-wrap space-x-2 bg-white px-5 pt-5"
  defaultClass=""
  activeClasses=""
  inactiveClasses=""
  contentClass="px-5 py-5">
  <TabItem
    title="DTDs"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableDTDs /></TabItem>
  <TabItem
    title="TableSeqSum1"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableSeqSum1 /></TabItem>
  <TabItem
    title="TableSeqSum2"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableSeqSum2 /></TabItem>
  <TabItem
    title="TableGbSeqs"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableGbSeqs /></TabItem>
  <TabItem
    open
    title="TableTaxSumm"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableTaxSumm /></TabItem>
</Tabs>
