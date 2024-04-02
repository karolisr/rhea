<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import type { PageData } from './$types'
import type { Writable } from 'svelte/store'
import type { DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import type { GBSeq } from '$lib/ncbi/types/GBSet'
import db_main from '$lib/app/svelte-stores/db-main'
import status from '$lib/app/svelte-stores/status'
import SeqView from '$lib/app/ui/views/SeqView'
import ObjectTreeView from '$lib/app/ui/views/ObjectTreeView'

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

<div>
  {#if rec}
    <span>
      {data.recid} | {rec.GBSeq_organism}
      {#if rec.GBSeq_feature_table && rec.GBSeq_feature_table[0].GBFeature_quals}
        | {rec.GBSeq_feature_table[0].GBFeature_quals[1].GBQualifier_value}
      {/if}
    </span>
    <SeqView {rec} />
    <div>
      <ObjectTreeView
        hideName
        name="{rec.GBSeq_accession_version}"
        obj="{rec}" />
    </div>
  {/if}
</div>
