<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Tabs, TabItem } from 'flowbite-svelte'
import { fileDropListener } from '$lib/app/api/filedrop'
import TableDTDs from './TableDTDs.svelte'

let fileDropUnListener: () => void

// inline-block text-sm font-medium text-center

const tabClassActive =
  '-mb-0.5 px-1 rounded-t-md border border-solid border-neutral-200 text-primary-600 border-b-white bg-white'

const tabClassInactive =
  '-mb-0.5 px-1 rounded-t-md border border-solid border-neutral-200 text-neutral-500 bg-neutral-100 hover:text-neutral-600 hover:bg-neutral-50'

onMount(async () => {
  fileDropUnListener = await fileDropListener()
})

onDestroy(() => {
  fileDropUnListener()
})
</script>

<Tabs
  divider="{true}"
  class="flex flex-wrap space-x-2 px-5 pt-5 bg-white"
  defaultClass=""
  activeClasses=""
  inactiveClasses=""
  contentClass="px-5 pt-5">
  <TabItem
    open
    title="DTDs"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableDTDs /></TabItem>
  <TabItem
    title="SeqSum"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"></TabItem>
  <TabItem
    title="GBSeq"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"></TabItem>
</Tabs>
