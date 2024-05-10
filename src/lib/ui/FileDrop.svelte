<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { dragDropFileListener } from '$lib/app/api/drag-drop-file'
import subheader from '$lib/app/svelte-stores/subheader'
import type { Unlistener } from '$lib/types'
$subheader = undefined

let fileDropUnListener: Unlistener

onMount(async () => {
  fileDropUnListener = await dragDropFileListener()
})

onDestroy(() => {
  if (fileDropUnListener !== undefined) {
    fileDropUnListener()
  }
})
</script>
