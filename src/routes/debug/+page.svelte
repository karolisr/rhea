<script lang="ts">
import { Tabs, TabItem, Button } from 'flowbite-svelte'
import TableDTDs from './TableDTDs.svelte'
import TableSeqSum1 from './TableSeqSum1.svelte'
import TableSeqSum2 from './TableSeqSum2.svelte'
import TableGbSeqs from './TableGBSeqs.svelte'
import TableTaxSumm from './TableTaxSumm.svelte'

import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'
let _db_main: Readable<DBMainSvelteStore>

const tabClassActive = `mb-0 px-2 pb-1 pt-1.5 rounded-t-md border border-solid
border-neutral-200 text-primary-600 border-b-white bg-white text-xs`

const tabClassInactive = `mb-0 px-2 pb-1 pt-1.5 rounded-t-md border border-solid
border-neutral-200 text-neutral-500 border-b-neutral-100 bg-neutral-100
hover:text-neutral-600 hover:bg-neutral-50 text-xs`
</script>

<Tabs
  divider="{false}"
  class="flex flex-wrap space-x-2 border-b border-t-neutral-100 bg-white px-5 pt-5"
  defaultClass=""
  activeClasses=""
  inactiveClasses=""
  contentClass="px-5 py-5">
  <TabItem
    open
    title="TableSeqSum1"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableSeqSum1 /></TabItem>

  <TabItem
    title="TableGbSeqs"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableGbSeqs /></TabItem>

  <TabItem
    title="TableTaxSumm"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableTaxSumm /></TabItem>

  <TabItem
    title="TableSeqSum2"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableSeqSum2 /></TabItem>

  <TabItem
    title="DTDs"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}"><TableDTDs /></TabItem>

  <TabItem
    title="Danger"
    activeClasses="{tabClassActive}"
    inactiveClasses="{tabClassInactive}">
    <Button
      color="red"
      on:click="{async () => {
        _db_main = await db_main
        await $_db_main.delete()
      }}">Delete DBMain</Button>
  </TabItem>
</Tabs>
