<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte'
import { getFontSize } from '$lib/utils'
import { ResizableGrid } from '$lib/ui/resizable-grid'
import { SeqViewController } from './seq-view-controller'
import { SeqList } from '$lib/seq/seq-list'
import { Alignment } from '$lib/seq/aln'
import { gSysInfo } from '$lib/backend/system-info'

const max = Math.max

let svc: SeqViewController
let scaleCtx: CanvasRenderingContext2D | null = null
let seqCtx: CanvasRenderingContext2D | null = null
let w: number
let h: number
let rowHs: number[] = [-1]
let colWs: number[] = [250, 10]
let gridTemplateRows: string
let gridTemplateCols: string

export let uid: string
export let seqs: SeqList | Alignment
export let siteSize = max(getFontSize() + 2, 16)
export let siteGapX = 1
export let siteGapY = 1
export let cnvScale: number = gSysInfo.pixelRatio
export let labelW = colWs[0]
export let scaleH = siteSize * 2

let minCnvW: number = siteSize * 2
let minCnvH: number = siteSize * 2

onMount(() => {
  const scaleCnv = document.getElementById(
    `${uid}-seqview-scale-canvas`
  ) as HTMLCanvasElement
  scaleCtx = scaleCnv.getContext('2d') as CanvasRenderingContext2D

  const seqCnv = document.getElementById(
    `${uid}-seqview-canvas`
  ) as HTMLCanvasElement
  seqCtx = seqCnv.getContext('2d') as CanvasRenderingContext2D
  svc = new SeqViewController(seqCtx, scaleCtx)
  addEventListener('resize', resizeEvtListener, {
    capture: false,
    passive: true
  })
})

onDestroy(() => {
  svc.removeEventListeners()
  removeEventListener('resize', resizeEvtListener, { capture: false })
})

function resizeEvtListener(_: UIEvent) {
  labelW = colWs[0]
}

$: if (svc) {
  svc.data = seqs
  svc.cnvW = w
  svc.cnvH = h - scaleH
  svc.labelW = labelW
  svc.scaleH = scaleH
  svc.siteSize = siteSize
  svc.cnvScale = cnvScale
  svc.siteGapX = siteGapX
  svc.siteGapY = siteGapY
  minCnvW = svc.minCnvW
  minCnvH = svc.minCnvH
  svc.draw()
}
</script>

<div
  class="seqview-element"
  bind:clientWidth="{w}"
  bind:clientHeight="{h}">
  <div
    class="seqview-scale"
    style="width:{w}px; height:{scaleH}px; min-width: {minCnvW}px; min-height: {scaleH}px;">
    <canvas
      id="{uid}-seqview-scale-canvas"
      class="seqview-scale-canvas"></canvas>
  </div>

  <div
    class="seqview"
    style="min-width: {minCnvW}px; min-height: {minCnvH}px;">
    <canvas
      id="{uid}-seqview-canvas"
      class="seqview-canvas"></canvas>
    {#if seqs.nRow > 0}
      <div
        class="seqview-grid-container"
        style="height:{h}px;"
        style:grid-template-rows="{gridTemplateRows}"
        style:grid-template-columns="{gridTemplateCols}">
        <ResizableGrid
          uid="{'grid-seqview'}"
          bind:rowHs
          bind:colWs
          bind:gridTemplateRows
          bind:gridTemplateCols
          fixedWCols="{[1]}"
          minColW="{0}"
          minRowH="{0}" />
      </div>
    {/if}
  </div>
</div>

<style>
.seqview-element {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;
  flex-grow: 1;
  flex-shrink: 1;
}

.seqview-scale {
  display: flex;
  overflow-x: hidden;
  overflow-y: hidden;
  flex-grow: 1;
  flex-shrink: 1;
}

.seqview-scale-canvas {
  background-color: transparent;
}

.seqview {
  display: flex;
  overflow-x: hidden;
  overflow-y: hidden;
  flex-grow: 1;
  flex-shrink: 1;
}

.seqview-canvas {
  background-color: transparent;
}

.seqview-grid-container {
  position: absolute;
  display: grid;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
