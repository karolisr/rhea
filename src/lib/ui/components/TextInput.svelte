<script lang="ts">
import { getFontSize } from '$lib/app/api'
export let id: string = ''
export let name: string = ''
export let value: string = ''
export let label: string = ''
export let placeholder: string = ''
export let tabindex: number = 0
</script>

<div class="container" style="padding-inline: {getFontSize() / 2}px;">
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
// .container {
//   display: flex;
//   flex-direction: row;
// }

// label {
//   align-self: center;
//   margin: 4px;
// }
</style>
