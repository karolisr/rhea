<script lang="ts">
export let id: string
export let checked: boolean = false
export let name: string = ''
export let value: string = ''
export let label: string = ''
export let group: string = ''
export let tabindex: number = 0
export let margin: boolean = false
let style: string = 'margin-inline-start: -1px;'
if (margin) {
  style += ' margin-block-start: calc(var(--pad) * 1);'
}
style = style.trim()
</script>

<radio-grid {style}>
  <input
    {id}
    {name}
    {value}
    {checked}
    {tabindex}
    bind:group
    on:change
    on:click
    type="radio" />
  {#if label}
    <label for="{id}">{label}</label>
  {/if}
</radio-grid>
