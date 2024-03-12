<script lang="ts">
import { Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte'
import { slide } from 'svelte/transition'
import { dtds, dtd_urls } from '$lib/app/stores/cache-dtd'

let openRow: number | null
let details

const toggleRow = (i: number) => {
  openRow = openRow === i ? null : i
}
</script>

<Table
  striped="{false}"
  shadow="{false}"
  hoverable="{true}"
  class="border border-solid border-neutral-200"
  divClass="overflow-hidden shadow"
  >
  <TableBody>
    {#each $dtd_urls as url, i}
      <TableBodyRow on:click="{() => toggleRow(i)}" class="border-neutral-200">
        {#if openRow === i}
          <TableBodyCell class="whitespace-nowrap bg-neutral-50 p-1"
            >{url}</TableBodyCell>
        {:else}
          <TableBodyCell class="whitespace-nowrap p-1"
            >{url}</TableBodyCell>
        {/if}
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow on:dblclick="{() => (details = $dtds[url])}">
          <TableBodyCell class='p-0 m-0 bg-white text-xs'><pre class="p-1" transition:slide="{{ duration: 500, axis: 'y' }}">{$dtds[url]}</pre></TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
