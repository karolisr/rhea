<script lang="ts">
import { onMount } from 'svelte'
import { v4 as uuid } from 'uuid'
import GridResizers from '$lib/ui/GridResizers.svelte'
import { randomColor } from '$lib'

export let uid: string = uuid()
export let nRow = 2
export let nCol = 2
export let minRowH: number = 20
export let minColW: number = 20
export let rowHs: number[] = []
export let colWs: number[] = []

let grid: HTMLElement

let rowHsStr: string = `repeat(${nRow}, 1fr)`
let colWsStr: string = `repeat(${nCol}, 1fr)`

onMount(() => {
  if (grid.children.length - 0 !== nRow * nCol) {
    throw new Error('grid.children.length !== nRow * nCol')
  }
  if (grid.children !== undefined) {
    for (let i = 0; i < grid.children.length - 0; i++) {
      const el = grid.children[i] as HTMLElement
      // el.style.setProperty('background-color', randomColor())
      el.style.setProperty('border-style', 'solid')
      el.style.setProperty('border-color', 'red')
      if (i < nRow && rowHs.length < i + 1) rowHs.push(el.clientHeight)
      if (i < nCol && colWs.length < i + 1) colWs.push(el.clientWidth)
    }
  }
})
</script>

<GridResizers
  {uid}
  {minRowH}
  {minColW}
  bind:rowHs
  bind:colWs
  bind:rowHsStr
  bind:colWsStr />
<div
  id="{uid}-grid"
  bind:this="{grid}"
  class="grid"
  style:grid-template-rows="{rowHsStr}"
  style:grid-template-columns="{colWsStr}">
  <slot />
</div>

<style>
.grid {
  display: grid;
  height: 100%;
  width: 100%;
}
</style>
