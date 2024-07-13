<script lang="ts">
import { onMount, onDestroy, tick } from 'svelte'
import { SeqRecord } from '$lib/seq/seq-record'
import { max } from '$lib'
import { getFontSize } from '$lib/app/api'
import GridSizers from '$lib/ui/utils/GridSizers.svelte'
import { SeqViewController } from './seq-view-controller'
import { SeqList } from '$lib/seq/seq-list'
import { Alignment } from '$lib/seq/aln'

let svc: SeqViewController
let ctx: CanvasRenderingContext2D | null = null
let cnvW: number
let cnvH: number
let rowHs: number[] = [-1]
let colWs: number[] = [200, 10]
let rowHsStr: string
let colWsStr: string

export let uid: string
export let seqs: SeqList | Alignment
export let siteSize = max(getFontSize() + 2, 16)
export let siteGapX = 1
export let siteGapY = 1
export let cnvScale: number = 1
export let labelW = colWs[0]

onMount(() => {
  const cnv = document.getElementById(
    `${uid}-seqview-canvas`
  ) as HTMLCanvasElement

  ctx = cnv.getContext('2d') as CanvasRenderingContext2D

  addEventListener('resize', resizeEvtListener, {
    capture: false
  })

  svc = new SeqViewController(ctx)
})

onDestroy(() => {
  removeEventListener('resize', resizeEvtListener, {
    capture: false
  })
})

function resizeEvtListener(_: UIEvent) {
  labelW = colWs[0]
}

$: if (svc) {
  svc.labelW = labelW
  svc.siteSize = siteSize
  svc.cnvScale = cnvScale
  svc.siteGapX = siteGapX
  svc.siteGapY = siteGapY
  svc.data = seqs
  svc.cnvW = cnvW
  svc.cnvH = cnvH
  if (seqs.nRow > 0) svc.draw()
}
</script>

<div
  class="seqview-element"
  bind:clientWidth="{cnvW}"
  bind:clientHeight="{cnvH}">
  <canvas id="{uid}-seqview-canvas" class="seqview-canvas"></canvas>
</div>
<div
  class="seqview-grid-container"
  style="height:{cnvH}px;"
  style:grid-template-rows="{rowHsStr}"
  style:grid-template-columns="{colWsStr}">
  <GridSizers
    enforceMaxSize="{false}"
    bind:rowHs
    bind:colWs
    bind:rowHsStr
    bind:colWsStr
    fixedWCols="{[1]}"
    minColW="{0}"
    minRowH="{0}" />
</div>

<style>
.seqview-grid-container {
  position: absolute;
  display: grid;
  overflow-x: hidden;
  overflow-y: hidden;
}

.seqview-element {
  display: flex;
  overflow-x: hidden;
  overflow-y: hidden;
  flex-grow: 1;
  flex-shrink: 1;
}

.seqview-canvas {
  flex-grow: 1;
  flex-shrink: 1;
}
</style>
