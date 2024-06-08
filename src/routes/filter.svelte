<script lang="ts">
import TextInput from '$lib/ui/components/TextInput.svelte'
export let value: string = ''
export let term: string = ''
$: processTerm(value)

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
    term = `${x}*`
  } else {
    term = ''
  }
}
</script>

<div class="container">
  <TextInput id="filter-input" placeholder="Filter" bind:value />
  <div class="tmp">
    {term}
  </div>
</div>

<style>
.container {
  display: flex;
  flex-direction: row;
  background-color: beige;
}

.tmp {
  border-style: solid;
  align-self: center;
  padding: 3px;
}
</style>
