<script lang="ts">
import { Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte'
import { slide } from 'svelte/transition'
import { dtds, dtd_urls } from '$lib/app/svelte-stores/cache-dtd'

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
  divClass="overflow-hidden shadow rounded-md">
  <TableBody>
    {#each $dtd_urls as url, i}
      <TableBodyRow on:click="{() => toggleRow(i)}">
        {#if openRow === i}
          <TableBodyCell class="whitespace-nowrap p-1">{url}</TableBodyCell>
        {:else}
          <TableBodyCell class="whitespace-nowrap p-1">{url}</TableBodyCell>
        {/if}
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow on:dblclick="{() => (details = $dtds[url])}">
          <TableBodyCell class="m-0 p-0 text-xs"
            ><pre
              class="p-1"
              transition:slide="{{ duration: 500, axis: 'y' }}">{$dtds[
                url
              ]}</pre></TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
