<script lang="ts">
import { dtds, dtd_urls } from '$lib/app/svelte-stores/cache-dtd'
import type { Indexed } from '$lib/types'
import { parse_dtd_txt } from '$lib/xml/dtd'
import { elements_to_json } from '$lib/xml/dtd/utils'
import ObjectTree from '$lib/app/ui/views/ObjectTree'

let openRow: number | null
let obj: Indexed

const toggleRow = async (i: number, dtd_txt: string, url: string) => {
  const dtd = await parse_dtd_txt(dtd_txt, url)
  obj = dtd ? elements_to_json(dtd) : {}
  openRow = openRow === i ? null : i
}
</script>

<table>
  <tbody>
    {#each $dtd_urls as url, i}
      <tr on:click="{() => toggleRow(i, $dtds[url], url)}">
        <td>{url}</td>
      </tr>
      {#if openRow === i}
        <tr>
          <td>
            {#if obj}
              <ObjectTree hideName name="{url}" {obj} />
            {/if}
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
