<script lang="ts">
import MainSearch from './main-search.svelte'
import MainFilter from './main-filter.svelte'

export let selectedCollGroup: string | undefined
</script>

{#if selectedCollGroup === 'collections-search-results'}
  {#key selectedCollGroup}
    <MainSearch></MainSearch>
  {/key}
{:else}
  {#key selectedCollGroup}
    <MainFilter></MainFilter>
  {/key}
{/if}
