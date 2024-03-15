<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte'
import { slide } from 'svelte/transition'

import { type ESummaryNuccore } from '$lib/ncbi'
import type { Writable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Writable<DBMainSvelteStore>
let esummaries: ESummaryNuccore[]
$: esummaries = _db_main ? $_db_main.seq_nt_summ : []

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
      <TableBodyRow on:click="{() => toggleRow(i)}" >
        {#if openRow === i}
          <TableBodyCell class="whitespace-nowrap p-1"
            >{summ.accessionversion}</TableBodyCell>
        {:else}
          <TableBodyCell class="whitespace-nowrap p-1"
            >{summ.accessionversion}</TableBodyCell>
        {/if}
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow>
          <TableBodyCell class="m-0 p-0 text-xs"
            ><pre
              class="p-1"
              transition:slide="{{
                duration: 250,
                axis: 'y'
              }}">{summ.title}</pre></TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
