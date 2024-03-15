<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { fileDropListener } from '$lib/app/api/filedrop'

let fileDropUnListener: () => void

onMount(async () => {
  fileDropUnListener = await fileDropListener()
})

onDestroy(() => {
  if (fileDropUnListener !== undefined) {
    fileDropUnListener()
  }
})

import subheader from '$lib/app/svelte-stores/subheader'
$subheader = undefined
</script>

<slot />
