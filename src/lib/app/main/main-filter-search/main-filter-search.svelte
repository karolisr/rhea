<script lang="ts">
import MainSearch from './main-search.svelte'
import MainFilter from './main-filter.svelte'

export let selCollGrp: string | undefined
</script>

{#if selCollGrp === 'coll-search-results'}
  {#key selCollGrp}
    <MainSearch></MainSearch>
  {/key}
{:else}
  {#key selCollGrp}
    <MainFilter></MainFilter>
  {/key}
{/if}
