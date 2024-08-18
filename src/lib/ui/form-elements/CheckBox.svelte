<script lang="ts">
export let id: string
export let checked: boolean | null | undefined = false
export let label: string = ''
export let name: string = ''
export let tabindex: number = -1
// export let margin: boolean = false
export let disabled: boolean = false
</script>

<div>
  <input
    {id}
    {name}
    bind:checked
    {tabindex}
    on:mousedown
    type="checkbox"
    {disabled} />
  {#if label}
    <label for="{id}">{label}</label>
  {/if}
</div>

<style lang="scss">
div {
  display: flex;
  flex-direction: row;
  column-gap: var(--pad);
  margin: var(--pad);
}
</style>
