<script lang="ts">
import { onMount } from 'svelte'
import { db_init } from '$lib/app/db'
import { type ESummaryNuccore } from '$lib/ncbi'
import { type DBMain } from '$lib/app/db/types'
import { type IDBPDatabase } from 'idb'
import { writable } from 'svelte/store'
import {
  Table,
  TableBody,
  TableBodyCell,
  TableBodyRow,
  TableHead,
  TableHeadCell,
  ImagePlaceholder,
  TableSearch,
  Modal
} from 'flowbite-svelte'
import { slide } from 'svelte/transition'

let openRow: number | null
let details: ESummaryNuccore

const toggleRow = (i: number) => {
  openRow = openRow === i ? null : i
}

let db: IDBPDatabase<DBMain>
let summs: ESummaryNuccore[] = []
async function get_from_db() {
  const tx = db.transaction('seq_nt_summ', 'readonly')
  summs = (await Promise.all([tx.store.getAll(), tx.done]))[0]
}

let searchTerm = ''
$: summs_filtered = summs.filter(
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
  db = await db_init()
  await get_from_db()
})
</script>

<TableSearch
  striped="{true}"
  hoverable="{true}"
  bind:inputValue="{searchTerm}"
  placeholder="Filter by organism"
  spellcheck="false"
  autocomplete="off">
  <TableHead>
    <TableHeadCell on:click="{() => sortTable('accessionversion')}"
      >Accession</TableHeadCell>
    <TableHeadCell on:click="{() => sortTable('title')}">Title</TableHeadCell>
    <TableHeadCell on:click="{() => sortTable('organism')}"
      >Organism</TableHeadCell>
    <TableHeadCell on:click="{() => sortTable('slen')}">Length</TableHeadCell>
  </TableHead>
  <TableBody tableBodyClass="divide-y">
    {#each $sortItems as s, i}
      <TableBodyRow on:click="{() => toggleRow(i)}">
        <TableBodyCell>{s.accessionversion}</TableBodyCell>
        <TableBodyCell>{s.title}</TableBodyCell>
        <TableBodyCell>{s.organism}</TableBodyCell>
        <TableBodyCell>{s.slen}</TableBodyCell>
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow on:dblclick="{() => (details = s)}">
          <TableBodyCell colspan="4" class="p-0">
            <div
              class="px-2 py-3"
              transition:slide="{{ duration: 300, axis: 'y' }}">
              <ImagePlaceholder />
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
  <ImagePlaceholder />
</Modal>
