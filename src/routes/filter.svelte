<script lang="ts">
import TextInput from '$lib/ui/components/TextInput.svelte'
import { getFontSize } from '$lib/app/api'
export let value: string = ''
export let term: string = ''
export let valueTax: string = ''
export let termTax: string = ''
$: term = processTerm(value)
$: termTax = processTerm(valueTax)

function processTerm(x: string) {
  if (x) {
    x = x.replaceAll(/\s+/g, ' ')
    x = x.replaceAll(/\++/g, '+')
    x = x.replaceAll(' and ', ' AND ')
    x = x.replaceAll(' or ', ' OR ')
    x = x.replaceAll(' not ', ' NOT ')
    x = x.replaceAll('*', '')
    x = x.replaceAll(/[^a-zA-Z\d\s+]/g, '')
    x = x.trim()
    x = x.replace(/^\+/g, '')
    x = x.replace(/\+$/g, '')
    x = x.replace(/^(AND|OR|NOT)/g, '')
    x = x.replace(/(AND|OR|NOT)$/g, '')
    x = x.trim()
  }
  if (x) {
    return `${x}*`
  } else {
    return ''
  }
}
</script>

<div
  class="filter-container"
  style="padding-inline: {getFontSize() / 2}px; gap: {getFontSize() / 2}px;">
  <TextInput id="filter-input" placeholder="Filter" bind:value />
  <div class="processed-term">
    {term}
  </div>
  <TextInput
    id="filter-input-tax"
    placeholder="Taxonomy"
    bind:value="{valueTax}" />
  <div class="processed-term">
    {termTax}
  </div>
</div>

<style>
.filter-container {
  display: flex;
  flex-direction: row;
  border-bottom-style: solid;
  align-items: center;
  height: 100%;
  background-color: seashell;
}

.processed-term {
  border-style: solid;
  align-self: center;
  padding: 3px;
  height: 1.9rem;
  background-color: ivory;
  flex-grow: 0;
  width: 200px;
}
</style>
