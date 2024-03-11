<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { fileDropListener } from '$lib/app/api/filedrop'
import SeqSummTable from '$lib/app/ui/tables/SeqSummTable.svelte'
// import { dtds, dtd_urls } from '$lib/app/stores/cache-dtd'

let fileDropUnListener: () => void

onMount(async () => {
  fileDropUnListener = await fileDropListener()
})

onDestroy(() => {
  fileDropUnListener()
})
</script>

<SeqSummTable />

<!-- {#each $dtd_urls as dtd_url}
  <pre
    class="
          m-2
          select-all
          rounded-md
          border
          border-neutral-300
          bg-lime-50
          p-2
        ">{dtd_url}</pre>
  <pre
    class="m-2
           select-text
           rounded-md
           border
           border-neutral-300
           bg-green-50
           p-2
          ">{$dtds[dtd_url]}</pre>
{/each} -->
