<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { writable } from 'svelte/store'
import {
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHead,
  TableHeadCell,
  TableSearch,
  Modal
} from 'flowbite-svelte'
import { slide } from 'svelte/transition'

import settings from '$lib/app/svelte-stores/settings'

import { type ESummaryNuccore } from '$lib/ncbi'
import type { Writable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

import status from '$lib/app/svelte-stores/status'

let _db_main: Writable<DBMainSvelteStore>
let esummaries: ESummaryNuccore[]
$: esummaries = _db_main ? $_db_main.seq_nt_summ : []
$: $status.main = `${esummaries.length.toLocaleString()} records`

let openRow: number | null
let details: ESummaryNuccore

const toggleRow = (i: number) => {
  openRow = openRow === i ? null : i
}

let searchTerm = ''
$: summs_filtered = esummaries.filter(
  (s) => s.organism.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
)

const sortKey = writable('organism') // default sort key
const sortDirection = writable(1) // default sort direction (ascending)
const sortItems = writable([] as ESummaryNuccore[]) // make a copy of the items array

// Define a function to sort the items
const sortTable = (key: string) => {
  // If the same key is clicked, reverse the sort direction
  if ($sortKey === key) {
    sortDirection.update((val) => -val)
  } else {
    sortKey.set(key)
    sortDirection.set(1)
  }
}

$: {
  const key = $sortKey
  const direction = $sortDirection
  const sorted = [...summs_filtered].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) {
      return -direction
    } else if (aVal > bVal) {
      return direction
    }
    return 0
  })
  sortItems.set(sorted)
}

onMount(async () => {
  _db_main = await db_main
  const x = document.getElementById('table-search')
  x?.setAttribute('spellcheck', 'false')
  x?.setAttribute('autocomplete', 'false')
  console.log()
})
onDestroy(() => {
  $status.main = ''
})
</script>

<TableSearch
  striped="{false}"
  hoverable="{false}"
  bind:inputValue="{searchTerm}"
  placeholder="Filter by organism"
  inputClass="block w-80 rounded-md border border-neutral-300 bg-neutral-50
              p-2 ps-10 text-xs text-neutral-900 focus:border-primary-500
              focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700
              dark:text-white dark:placeholder-neutral-400
              dark:focus:border-primary-500 dark:focus:ring-primary-500"
  searchClass="relative mt-0"
  innerDivClass="p-3"
  divClass="overflow-hidden shadow rounded-md">
  <TableHead theadClass="text-xs uppercase">
    <TableHeadCell
      class="whitespace-nowrap bg-neutral-100 p-1"
      on:click="{() => sortTable('accessionversion')}">Accession</TableHeadCell>
    <TableHeadCell
      class="whitespace-nowrap bg-neutral-100 p-1"
      on:click="{() => sortTable('title')}">Title</TableHeadCell>
    <TableHeadCell
      class="whitespace-nowrap bg-neutral-100 p-1"
      on:click="{() => sortTable('organism')}">Organism</TableHeadCell>
    <TableHeadCell
      class="whitespace-nowrap bg-neutral-100 p-1"
      on:click="{() => sortTable('slen')}">Length</TableHeadCell>
  </TableHead>
  <TableBody tableBodyClass="divide-y text-xs">
    {#each $sortItems as s, i}
      <TableBodyRow on:click="{() => toggleRow(i)}">
        <TableBodyCell class="whitespace-nowrap p-1"
          ><a
            class="cursor-pointer font-semibold text-primary-800 hover:text-primary-600"
            href="/view/{s.accessionversion}">{s.accessionversion}</a>
        </TableBodyCell>
        <TableBodyCell class="whitespace-nowrap p-1">{s.genome}</TableBodyCell>
        <TableBodyCell class="whitespace-nowrap p-1"
          >{s.organism}</TableBodyCell>
        <TableBodyCell class="whitespace-nowrap p-1"
          >{s.slen.toLocaleString($settings.locale)}</TableBodyCell>
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow on:dblclick="{() => (details = s)}">
          <TableBodyCell colspan="4" class="m-0 p-0">
            <div
              class="px-2 py-2"
              transition:slide="{{ duration: 300, axis: 'y' }}">
              <p>{s.accessionversion}</p>
              <p>{s.title}</p>
              <p>{s.organism}</p>
            </div>
          </TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</TableSearch>
<Modal
  title="{details?.accessionversion}"
  open="{!!details}"
  autoclose
  outsideclose>
  <p>{details.accessionversion}</p>
  <p>{details.title}</p>
  <p>{details.organism}</p>
</Modal>
