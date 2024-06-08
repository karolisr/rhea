<script lang="ts">
import TextInput from '$lib/ui/components/TextInput.svelte'
import { getFontSize } from '$lib/app/api'
export let value: string = ''
export let term: string = ''

$: processTerm(value)

function processTerm(x: string) {
  term = x
}
</script>

<div
  class="search-container"
  style="padding-inline: {getFontSize() / 2}px; gap: {getFontSize() / 2}px;">
  <TextInput id="filter-input" placeholder="Search" bind:value />
  <div class="processed-term">
    {term}
  </div>
</div>

<style>
.search-container {
  display: flex;
  flex-direction: row;
  border-bottom-style: solid;
  align-items: center;
  height: 100%;
  background-color: azure;
}

.processed-term {
  border-style: solid;
  align-self: center;
  padding: 3px;
  height: 1.9rem;
  background-color: ivory;
  flex-grow: 1;
}
</style>
