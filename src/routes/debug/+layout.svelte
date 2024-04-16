<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import NavDebug from './nav.svelte'
import subheader from '$lib/app/svelte-stores/subheader'

onMount(() => {
  $subheader = NavDebug
})
onDestroy(() => {
  $subheader = undefined
})
</script>

<slot />
