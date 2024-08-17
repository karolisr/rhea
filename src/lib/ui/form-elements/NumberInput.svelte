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
export let step: number = 1
export let valid: boolean = true

function validate(value: number) {
  const m = String(value).trim().match(/\d+/)
  if (m) {
    value = Number(m[0])
    valid = true
  } else {
    valid = false
  }
}

$: validate(value)

$: if (value < minVal) value = minVal
$: if (value > maxVal) value = maxVal
</script>

<div class="number-input-container">
  {#if label}
    <div><label for="{id}">{label}</label></div>
  {/if}
  <input
    {id}
    {name}
    bind:value
    {tabindex}
    {required}
    {disabled}
    {step}
    on:change
    on:input
    on:click
    type="number"
    min="{minVal}"
    max="{maxVal}"
    spellcheck="false"
    autocomplete="off" />
</div>
