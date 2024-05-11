<script lang="ts">
import type { Indexed } from '$lib/types'
import { onMount } from 'svelte'
import { getPropNames } from '$lib'
import sql from 'sql-template-tag'
import databases from '$lib/app/svelte-stores/databases'

let dbs: Awaited<typeof databases>
let results: Indexed[] = []

onMount(async () => {
  dbs = await databases
  results = await $dbs.dbTaxonomy.select<Indexed[]>(sql`
    SELECT
      tx_names.tax_id,
      tx_images.url,
      tx_names.name
    FROM
      tx_assoc_nodes_images
      INNER JOIN tx_names ON tx_names.tax_id = tx_assoc_nodes_images.tax_id
      INNER JOIN tx_images ON tx_images.id = tx_assoc_nodes_images.img_id
    WHERE
      tx_names.name LIKE '%physalis%';
  `.text)
})
</script>

<div style="overflow-y: scroll;">
  {#each results as r}
    <div>
      {#each getPropNames(r) as pn}
        <pre style="user-select: text; -webkit-user-select: text;">{pn}: {r[
            pn
          ]}</pre>
        {#if pn === 'url'}
          <img
            style="width: 300px; aspect-ratio: auto;"
            src="{String(
              r[pn].replace('http', 'https').replace('httpss', 'https')
            )}"
            alt="" />
        {/if}
      {/each}
      <br />
    </div>
  {/each}
</div>
