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

let scaleCnv: HTMLCanvasElement
let scaleCtx: CanvasRenderingContext2D

let seqLabCnv: HTMLCanvasElement
let seqLabCtx: CanvasRenderingContext2D

let seqCnv: HTMLCanvasElement
let seqCtx: CanvasRenderingContext2D

export let uid: string
export let seqs: SeqList | Alignment
export let siteSize = max(getFontSize() + 2, 16)
export let siteGapX = 0
export let siteGapY = 0
export let cnvScale: number = gSysInfo.pixelRatio
export let labelW = 250
export let scaleH = siteSize * 1.75

let rowHs: number[] = [scaleH, -1]
let colWs: number[] = [labelW, -1]

let rowHsCalc: number[] | undefined
let colWsCalc: number[] | undefined

let w: number
let h: number

onMount(() => {
  scaleCtx = scaleCnv.getContext('2d') as CanvasRenderingContext2D
  seqLabCtx = seqLabCnv.getContext('2d') as CanvasRenderingContext2D
  seqCtx = seqCnv.getContext('2d') as CanvasRenderingContext2D
  svc = new SeqViewController(scaleCtx, seqLabCtx, seqCtx)
})

onDestroy(() => {
  svc.removeEventListeners()
})

$: if (rowHsCalc !== undefined && colWsCalc !== undefined) {
  w = colWsCalc[0] + colWsCalc[1]
  h = rowHsCalc[0] + rowHsCalc[1]
  scaleH = rowHsCalc[0]
  labelW = colWsCalc[0]
}

$: if (w !== undefined && h !== undefined && svc !== undefined) {
  svc.data = seqs
  svc.cnvW = w
  svc.cnvH = h - scaleH
  svc.labelW = labelW
  svc.scaleH = scaleH
  svc.siteSize = siteSize
  svc.cnvScale = cnvScale
  svc.siteGapX = siteGapX
  svc.siteGapY = siteGapY
  svc.draw()
}
</script>

<ResizableGrid
  uid="{'grid-tb-scale-seqview'}"
  {rowHs}
  {colWs}
  minRowH="{svc ? svc.minCnvH : 1}"
  minColW="{svc ? svc.minCnvW : 1}"
  bind:rowHsCalc
  bind:colWsCalc>
  <div></div>
  <canvas
    bind:this="{scaleCnv}"
    id="{uid}-seqview-scale-canvas"
    class="seqview-scale-canvas"></canvas>
  <canvas
    bind:this="{seqLabCnv}"
    id="{uid}-seqview-labels-canvas"
    class="seqview-labels-canvas"></canvas>
  <canvas
    bind:this="{seqCnv}"
    id="{uid}-seqview-canvas"
    class="seqview-canvas"></canvas>
</ResizableGrid>
