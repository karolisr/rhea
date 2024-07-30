<script lang="ts">
export let id: string
export let checked: boolean | null | undefined = false
export let label: string = ''
export let tabindex: number = -1
export let margin: boolean = false
export let disabled: boolean = false
let style: string = 'margin-inline-start: 0px;'
if (margin) {
  style += ' margin-block-start: calc(var(--pad) * 1);'
}
style = style.trim()
</script>

<checkbox-grid {style}>
  <div style="">
    <input
      {id}
      bind:checked
      {tabindex}
      on:mousedown
      type="checkbox"
      {disabled} />
  </div>
  {#if label}
    <label for="{id}">{label}</label>
  {/if}
</checkbox-grid>
