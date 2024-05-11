<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import type { Indexed } from '$lib/types'
import { getPropNames } from '$lib/utils'
import sql from 'sql-template-tag'
import databases from '$lib/app/svelte-stores/databases'

let dbs: Awaited<typeof databases>

let results: Indexed[] = []
let query: string = 'western gray kangaroo'
let working: boolean = false
let timer: number

async function getSuggestions() {
  if (query.length < 3) {
    results = []
    return
  }
  clearTimeout(timer)
  timer = setTimeout(async () => {
    working = true
    const _query =
      `*[${query.trim()[0].toLowerCase()}${query.trim()[0].toUpperCase()}]${query.trim().slice(1)}*`.replaceAll(
        ' ',
        '*'
      )
    const _sql = sql`
      SELECT
        tx_names.tax_id,
        tx_images.url,
        tx_names.name
      FROM
        tx_assoc_nodes_images
        CROSS JOIN tx_names ON tx_names.tax_id = tx_assoc_nodes_images.tax_id
        CROSS JOIN tx_images ON tx_images.id = tx_assoc_nodes_images.img_id
      WHERE
        (
          name_class = 'scientific name'
          OR name_class = 'common name'
          OR name_class = 'genbank common name'
        )
        AND name GLOB ${_query}
      LIMIT
        10;
    `
    results = await $dbs.dbTaxonomy.select<Indexed[]>(_sql.text, _sql.values)
    results = results
    working = false
  }, 300)
}

onMount(async () => {
  dbs = await databases
  await getSuggestions()
})

onDestroy(async () => {})
</script>

<div style="align-items: center; text-align: center; overflow-y: scroll;">
  <div
    style="margin: auto; position: sticky; top: 0px; background-color: beige; padding: 10px;">
    <input
      type="text"
      name="search-input"
      id="search-input"
      spellcheck="false"
      autocomplete="off"
      style="width: 400px;"
      bind:value="{query}"
      on:input="{() => {
        getSuggestions()
      }}" />
  </div>
  <div style="background-color: aliceblue; margin-inline: auto; padding: 10px;">
    {#each results as r}
      <div
        style="border-style: dotted; display: flex; flex-direction: column; margin-inline: auto; margin-block: 10px; padding: 10px; align-items: center;">
        {#each getPropNames(r) as pn}
          {#if pn !== 'url'}
            <div style="margin: 0px; font-size: large;">{r[pn]}</div>
          {:else}
            <br />
            <!-- {#key r} -->
            <img
              style="max-height: 200px; max-width: 200px;"
              src="{String(
                r[pn].replace('http', 'https').replace('httpss', 'https')
              )}"
              alt="" />
            <!-- {/key} -->
          {/if}
        {/each}
        <br />
      </div>
    {/each}
  </div>
</div>
