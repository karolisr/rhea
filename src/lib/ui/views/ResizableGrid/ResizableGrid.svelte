<script lang="ts">
import GridSizers from '$lib/ui/utils/GridSizers.svelte'
import { v4 as uuid } from 'uuid'
import { fade as trans } from 'svelte/transition'

export let uid: string = uuid()
export let minRowH: number = 50
export let minColW: number = 50
export let nRow: number
export let nCol: number
export let rowHs: number[]
export let colWs: number[]
export let rowsResizable: boolean = true
export let colsResizable: boolean = true
export let enforceMaxSize: boolean = true
export let fixedHRows: number[] = []
export let fixedWCols: number[] = []

let rowHsStr: string
let colWsStr: string
</script>

<div
  transition:trans="{{ delay: 0, duration: 1000 }}"
  class="grid-container"
  style:grid-template-rows="{rowHsStr}"
  style:grid-template-columns="{colWsStr}">
  <div class="grid-items" style:grid-row="1/{nRow + 1}" style:grid-column="1/{nCol + 1}">
    <slot />
  </div>

  <GridSizers
    {uid}
    {minRowH}
    {minColW}
    bind:nRow
    bind:nCol
    bind:rowHs
    bind:colWs
    {rowsResizable}
    {colsResizable}
    {enforceMaxSize}
    {fixedHRows}
    {fixedWCols}
    bind:rowHsStr
    bind:colWsStr />
</div>

<style lang="scss">
.grid-container {
  display: grid;
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

.grid-items {
  display: grid;
  grid-template-rows: subgrid;
  grid-template-columns: subgrid;
  background-color: white;
  z-index: 21;
}
</style>
