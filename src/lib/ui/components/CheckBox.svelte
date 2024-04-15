<script lang="ts">
export let checked: boolean | null | undefined = false
export let id: string = ''
export let label: string = ''
export let tabindex: number = -1
export let margin: boolean = true
let style: string = ''
if (margin) {
  style += ' margin-top: calc(var(--pad) * 1);'
}
style = style.trim()
</script>

<checkbox-grid {style}>
  <div>
    <input {id} bind:checked {tabindex} on:mousedown type="checkbox" />
  </div>
  {#if label}
    <label for="{id}">{label}</label>
  {/if}
</checkbox-grid>

<style lang="scss">
checkbox-grid {
  display: grid;
  grid-template-columns: calc(var(--fs) + calc(var(--pad) * 2)) auto;
}
</style>
