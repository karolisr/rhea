<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import NavDebug from './nav.svelte'
import subheader from '$lib/svelte-stores/subheader'

$subheader = NavDebug

onMount(() => {})

onDestroy(() => {
  $subheader = undefined
})
</script>

<slot />
