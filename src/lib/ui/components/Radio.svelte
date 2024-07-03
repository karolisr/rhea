<script lang="ts">
export let checked: boolean = false
export let id: string = ''
export let name: string = ''
export let value: string = ''
export let label: string = ''
export let group: string = ''
export let tabindex: number = 0
export let margin: boolean = true
let style: string = ''
if (margin) {
  style += ' margin-top: calc(var(--pad) * 1);'
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

<style lang="scss">
// radio-grid {
//   display: grid;
//   grid-template-columns:
//     calc(var(--fs) + var(--pad))
//     auto;
//   align-items: center;
// }
</style>
