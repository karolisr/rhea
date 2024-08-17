<script lang="ts">
export let id: string = ''
export let name: string = ''
export let value: number = 0
export let label: string = ''
export let tabindex: number = 0
export let required: boolean = false
export let disabled: boolean = false
export let minVal: number = 0
export let maxVal: number = 100
</script>

<div class="range-input-container">
  {#if label}
    <label for="{id}">{label}</label>
  {/if}
  <input
    {id}
    {name}
    bind:value
    {tabindex}
    {required}
    {disabled}
    on:change
    on:input
    on:click
    type="range"
    min="{minVal}"
    max="{maxVal}"
    spellcheck="false"
    autocomplete="off" />
</div>

<style lang="scss">
</style>
