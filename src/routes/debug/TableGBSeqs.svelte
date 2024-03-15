<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte'
import { slide } from 'svelte/transition'

import { type GBSeq } from '$lib/ncbi/types/gbseq'
import type { Writable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Writable<DBMainSvelteStore>
let gbseqs: GBSeq[]
$: gbseqs = _db_main ? $_db_main.gbseq : []

import status from '$lib/app/svelte-stores/status'
$: $status.main = `${gbseqs.length.toLocaleString()} records`

let openRow: number | null

const toggleRow = (i: number) => {
  openRow = openRow === i ? null : i
}

onMount(async () => {
  _db_main = await db_main
})
onDestroy(() => {
  $status.main = ''
})
</script>

<Table
  striped="{false}"
  shadow="{false}"
  hoverable="{true}"
  divClass="overflow-hidden shadow rounded-md">
  <TableBody tableBodyClass="text-xs">
    {#each gbseqs as gbseq, i}
      <TableBodyRow on:click="{() => toggleRow(i)}">
        <TableBodyCell class="whitespace-nowrap p-1"
          >{gbseq.GBSeq_accession_version}</TableBodyCell>
        <TableBodyCell class="whitespace-nowrap p-1">
          {gbseq.GBSeq_organism}</TableBodyCell>
        <TableBodyCell class="whitespace-nowrap p-1">
          {gbseq.GBSeq_length.toLocaleString()}</TableBodyCell>
        <TableBodyCell class="whitespace-nowrap p-1">
          {gbseq.GBSeq_definition}</TableBodyCell>
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow>
          <TableBodyCell colspan="4" class="m-0 p-0"
            ><pre
              class="p-1"
              transition:slide="{{
                duration: 250,
                axis: 'y'
              }}">{gbseq.GBSeq_definition}</pre></TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
