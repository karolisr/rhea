<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import ObjectTree from '$lib/app/ui/views/ObjectTree'
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

<table>
  <tbody>
    {#each taxa as tx, i}
      <tr on:click="{() => toggleRow(i)}">
        <td>{tx.ScientificName}</td>
        <td>{tx.TaxId}</td>
      </tr>
      {#if openRow === i}
        <tr>
          <td colspan="2">
            <ObjectTree hideName obj="{tx}" />
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
