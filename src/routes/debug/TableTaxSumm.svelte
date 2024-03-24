<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte'
import { slide } from 'svelte/transition'
import ObjectTree from '$lib/app/ui/components/views/ObjectTree'
import { type Taxon } from '$lib/ncbi/types/TaxaSet'
import type { Writable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Writable<DBMainSvelteStore>
let taxa: Taxon[]
$: taxa = _db_main
  ? $_db_main.taxon.sort((a, b) =>
      a.ScientificName < b.ScientificName ? -1 : 1
    )
  : []

let openRow: number | null

const toggleRow = (i: number) => {
  openRow = openRow === i ? null : i
}

onMount(async () => {
  _db_main = await db_main
})
onDestroy(() => {})
</script>

<Table
  striped="{false}"
  shadow="{false}"
  hoverable="{true}"
  divClass="overflow-hidden shadow rounded-md">
  <TableBody>
    {#each taxa as tx, i}
      <TableBodyRow on:click="{() => toggleRow(i)}">
        {#if openRow === i}
          <TableBodyCell class="whitespace-nowrap p-1"
            >{tx.ScientificName}
            {tx.TaxId}</TableBodyCell>
        {:else}
          <TableBodyCell class="whitespace-nowrap p-1"
            >{tx.ScientificName}
            {tx.TaxId}</TableBodyCell>
        {/if}
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow>
          <TableBodyCell class="m-0 p-0 text-xs">
            <div class="p-2" transition:slide="{{ duration: 300, axis: 'y' }}">
              <ObjectTree hideName obj="{tx}" />
            </div>
          </TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
