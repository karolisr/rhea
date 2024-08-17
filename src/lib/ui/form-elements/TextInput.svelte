<script lang="ts">
export let id: string = ''
export let name: string = ''
export let value: string = ''
export let label: string = ''
export let placeholder: string = ''
export let tabindex: number = 0
export let required: boolean = false
export let disabled: boolean = false
</script>

{#if label}
  <label for="{id}">{label}</label>
{/if}
<input
  {id}
  {name}
  bind:value
  {tabindex}
  {placeholder}
  {required}
  {disabled}
  on:change
  on:input
  on:click
  type="text"
  spellcheck="false"
  autocomplete="off" />

<style>
input {
  flex-grow: 1;
}
</style>
