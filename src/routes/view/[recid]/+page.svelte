<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import type { PageData } from './$types'
import type { Writable } from 'svelte/store'
import type { DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import type { GBSeq } from '$lib/ncbi/types/gbseq'
import db_main from '$lib/app/svelte-stores/db-main'
import status from '$lib/app/svelte-stores/status'
import SeqView from './SeqView.svelte'

export let data: PageData

let _db_main: Writable<DBMainSvelteStore>
let db: typeof $_db_main.db
let rec: GBSeq | undefined

$: $status.main = `${data.recid}`

onMount(async () => {
  _db_main = await db_main
  db = $_db_main.db
  rec = await db.get('gbseq', data.recid)
})
onDestroy(() => {
  $status.main = ''
})
</script>

<div class="pt-5">
  {#if rec}
    <span class="pb-5 text-center text-base">
      {data.recid}
      |
      {rec.GBSeq_organism}
      |
      {rec.GBSeq_feature_table.GBFeature[0].GBFeature_quals.GBQualifier[1]
        .GBQualifier_value}
    </span>
    <SeqView {rec} />
  {/if}
</div>

<style>
div {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
