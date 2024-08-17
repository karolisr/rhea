<script lang="ts">
export let id: string
export let checked: boolean | null | undefined = false
export let label: string = ''
export let tabindex: number = -1
// export let margin: boolean = false
export let disabled: boolean = false
</script>

<input
  {id}
  bind:checked
  {tabindex}
  on:mousedown
  type="checkbox"
  aria-label="{label}"
  {disabled} />
<label for="id">{label}</label>
<br />

<!-- <style lang="scss">
input {
  width: 13px;
  height: 13px;
  margin-inline-start: 2px;
  margin-block-start: 2px;
}
</style> -->
