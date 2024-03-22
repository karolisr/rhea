<script lang="ts">
import { Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte'
import { slide } from 'svelte/transition'
import { dtds, dtd_urls } from '$lib/app/svelte-stores/cache-dtd'
import type { Indexed } from '$lib/types'
import { parse_dtd_txt } from '$lib/xml/dtd'
import ObjectTree from '$lib/app/ui/components/views/ObjectTree'

let openRow: number | null
let obj: Indexed | undefined

const toggleRow = async (i: number, dtd_txt: string, url: string) => {
  obj = await parse_dtd_txt(dtd_txt, url)
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
      <TableBodyRow on:click="{() => toggleRow(i, $dtds[url], url)}">
        {#if openRow === i}
          <TableBodyCell class="whitespace-nowrap p-1">{url}</TableBodyCell>
        {:else}
          <TableBodyCell class="whitespace-nowrap p-1">{url}</TableBodyCell>
        {/if}
      </TableBodyRow>
      {#if openRow === i}
        <TableBodyRow>
          <TableBodyCell class="m-0 p-0">
            <div
              class="p-2"
              transition:slide="{{
                delay: 0,
                duration: 500,
                axis: 'y'
              }}">
              {#if obj}
                <ObjectTree hideName name="{url}" {obj} />
              {/if}
            </div>
          </TableBodyCell>
        </TableBodyRow>
      {/if}
    {/each}
  </TableBody>
</Table>
