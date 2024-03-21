<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte'
import { slide } from 'svelte/transition'
import ObjectTree from '$lib/app/ui/views/ObjectTree'
import { type ESummaryTaxonomy } from '$lib/ncbi'
import type { Writable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Writable<DBMainSvelteStore>
let esummaries: ESummaryTaxonomy[]
$: esummaries = _db_main ? $_db_main.tax_summ : []

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
    {#each esummaries as summ, i}
      <TableBodyRow on:click="{() => toggleRow(i)}">
        {#if openRow === i}
          <TableBodyCell class="whitespace-nowrap p-1"
            >{summ.scientificname}
            {summ.taxid}
            {summ.commonname}</TableBodyCell>
        {:else}
          <TableBodyCell class="whitespace-nowrap p-1"
            >{summ.scientificname}
            {summ.taxid}
            {summ.commonname}</TableBodyCell>
        {/if}
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow>
          <TableBodyCell class="m-0 p-0 text-xs">
            <div class="p-2" transition:slide="{{ duration: 300, axis: 'y' }}">
              <ObjectTree hideName obj="{summ}" />
            </div>
          </TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
