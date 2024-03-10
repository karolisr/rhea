<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { fileDropListener } from '$lib/app/api/filedrop'
import cache_dtd from '$lib/app/stores/cache-dtd'

$: dtdks = $cache_dtd ? Object.getOwnPropertyNames($cache_dtd).sort() : []

let fileDropUnListener: () => void

onMount(async () => {
  fileDropUnListener = await fileDropListener()
})

onDestroy(() => {
  fileDropUnListener()
})
</script>

{#each dtdks as k}
  <pre
    class="m-2 select-all rounded-md border border-neutral-300 bg-lime-50 p-2">{k}</pre>
  <!-- <pre class="m-2 select-text rounded-md border border-neutral-300 bg-green-50 p-2">{$cache_dtd[k]}</pre> -->
{/each}
