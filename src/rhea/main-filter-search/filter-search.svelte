<script lang="ts">
import Search from './search.svelte'
import Filter from './filter.svelte'

export let selCollGrp: string | undefined
export let idsByFilterTerm: Set<string> | undefined
</script>

{#if selCollGrp === 'coll-search-results'}
  <Search />
{:else}
  <Filter bind:idsByFilterTerm />
{/if}
