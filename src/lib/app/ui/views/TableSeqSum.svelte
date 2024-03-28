<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { writable } from 'svelte/store'
import settings from '$lib/app/svelte-stores/settings'
import { type ESummaryNuccore } from '$lib/ncbi'
import type { Writable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'
import status from '$lib/app/svelte-stores/status'
import ObjectTree from '$lib/app/ui/views/ObjectTree'
import type { GBSeq } from '$lib/ncbi/types/GBSet'

let _db_main: Writable<DBMainSvelteStore>
let esummaries: ESummaryNuccore[]
$: esummaries = _db_main ? $_db_main.seq_nt_summ : []
$: $status.main = `${esummaries.length.toLocaleString()} records`

let openRow: number | null
let details: ESummaryNuccore | undefined
let obj: GBSeq | undefined

const toggleRow = async (i: number, s: ESummaryNuccore) => {
  obj = await $_db_main.get(s.accessionversion, 'gbseq')
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
})
onDestroy(() => {
  $status.main = ''
})
</script>

<input type="text" bind:value="{searchTerm}" placeholder="Filter by organism" />

<!-- <div
  on:close="{() => (details = undefined)}"
  title="{details?.accessionversion}">
  {#if obj}
    <ObjectTree hideName {obj} />
  {/if}
</div> -->

<table>
  <thead>
    <th on:click="{() => sortTable('accessionversion')}">Accession</th>
    <th on:click="{() => sortTable('genome')}">Organelle</th>
    <th on:click="{() => sortTable('organism')}">Organism</th>
    <th on:click="{() => sortTable('slen')}">Length</th>
  </thead>
  <tbody>
    {#each $sortItems as s, i}
      <tr on:click="{() => toggleRow(i, s)}">
        <td><a href="/view/{s.accessionversion}">{s.accessionversion}</a></td>
        <td>{s.genome}</td>
        <td>{s.organism}</td>
        <td>{s.slen.toLocaleString($settings.locale)}</td>
      </tr>
      {#if openRow === i}
        <tr on:dblclick="{() => (details = s)}">
          <td colspan="4">
            <div>
              {#if obj}
                <ObjectTree hideName {obj} />
              {/if}
            </div>
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
