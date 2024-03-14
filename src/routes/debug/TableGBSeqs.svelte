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
    class="border border-solid border-neutral-200"
    divClass="overflow-hidden shadow">
    <TableBody>
      {#each gbseqs as gbseq, i}
        <TableBodyRow on:click="{() => toggleRow(i)}" class="border-neutral-200">
          {#if openRow === i}
            <TableBodyCell class="whitespace-nowrap bg-neutral-50 p-1"
              >{gbseq.GBSeq_accession_version}</TableBodyCell>
          {:else}
            <TableBodyCell class="whitespace-nowrap p-1"
              >{gbseq.GBSeq_accession_version}</TableBodyCell>
          {/if}
        </TableBodyRow>
        {#if openRow === i}
          <TableBodyRow>
            <TableBodyCell class="m-0 bg-white p-0 text-xs"
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
