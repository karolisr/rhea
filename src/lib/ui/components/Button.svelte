<script lang="ts">
export let id: string = ''
export let label: string = ''
export let tabindex: number = 0
export let disabled: boolean = false
</script>

<!-- <input
  {id}
  bind:value="{label}"
  {tabindex}
  {disabled}
  on:click
  type="button"
  spellcheck="false"
  autocomplete="off" /> -->

<button {id} {tabindex} {disabled} on:click>{label}</button>
