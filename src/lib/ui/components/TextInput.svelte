<script lang="ts">
export let id: string = ''
export let name: string = ''
export let value: string = ''
export let label: string = ''
export let placeholder: string = ''
export let tabindex: number = 0
</script>

<div class="text-input-container">
  {#if label}
    <label for="{id}">{label}</label>
  {/if}
  <input
    {id}
    {name}
    bind:value
    {tabindex}
    {placeholder}
    on:change
    on:input
    on:click
    type="text"
    spellcheck="false"
    autocomplete="off" />
</div>

<style lang="scss">
</style>
