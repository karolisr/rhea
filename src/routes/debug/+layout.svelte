<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import NavDebug from './nav.svelte'
import type { LayoutData } from './$types'
export let data: LayoutData

onMount(() => {
  data.layout.subheader = NavDebug
})

onDestroy(() => {
  data.layout.subheader = undefined
})
</script>

<slot />
