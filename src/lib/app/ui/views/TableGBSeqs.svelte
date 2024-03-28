<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import ObjectTree from '$lib/app/ui/views/ObjectTree'
import { type GBSeq } from '$lib/ncbi/types/GBSet'
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

<table>
  <tbody>
    {#each gbseqs as gbseq, i}
      <tr on:click="{() => toggleRow(i)}">
        <td
          ><a href="/view/{gbseq.GBSeq_accession_version}"
            >{gbseq.GBSeq_accession_version}</a
          ></td>
        <td> {gbseq.GBSeq_organism}</td>
        <td> {gbseq.GBSeq_length.toLocaleString()}</td>
        <td> {gbseq.GBSeq_definition}</td>
      </tr>
      {#if openRow === i}
        <tr>
          <td colspan="4">
            <ObjectTree
              hideName
              name="{gbseq.GBSeq_accession_version}"
              obj="{gbseq}" />
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
