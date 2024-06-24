<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { max, min } from '$lib'
import { prepareSiteImages, drawSeqLabel } from '.'

export let uid: string
export let seqId: string | undefined = undefined
export let seqType: string | undefined = undefined
export let seq: string | undefined = undefined
export let cnvScale: number = 2
export let siteSize = 18
export let labelW = siteSize * 10
export let siteGapX = 0
export let siteGapY = 0
export let minW: number = labelW + siteSize * 20
export let minH: number = siteSize

let ctx: CanvasRenderingContext2D | null = null

let cnvW: number
let cnvH: number

let deltaX: number
let deltaY: number

let renderedSites: Map<string, HTMLCanvasElement>

function drawSite(
  ctx: CanvasRenderingContext2D,
  label: string,
  renderedSites: Map<string, HTMLCanvasElement>
) {
  ctx.drawImage(renderedSites.get(label) as HTMLCanvasElement, 0, 0)
}

function drawSites(
  ctx: CanvasRenderingContext2D,
  seq: string,
  deltaX: number,
  cnvScale: number,
  renderedSites: Map<string, HTMLCanvasElement>
) {
  for (let i = 0; i < min(seq.length, 50); i++) {
    const label = seq[i]
    drawSite(ctx, label, renderedSites)
    ctx.translate(deltaX * cnvScale, 0)
  }
}

function setCnvSize(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  minW: number,
  minH: number
) {
  w = max(minW, w)
  h = max(minH, h)
  ctx.canvas.width = w * cnvScale
  ctx.canvas.height = h * cnvScale
  ctx.canvas.style.width = `${w}px`
  ctx.canvas.style.height = `${h}px`
  ctx.reset()
}

function draw(
  ctx: CanvasRenderingContext2D | null,
  cnvW: number,
  cnvH: number,
  minW: number,
  minH: number,
  deltaX: number,
  deltaY: number,
  cnvScale: number,
  siteSize: number,
  seqId: string | undefined,
  seq: string | undefined,
  renderedSites: Map<string, HTMLCanvasElement>
) {
  if (ctx !== null) {
    setCnvSize(ctx, cnvW, cnvH, minW, minH)
    if (seqId !== undefined)
      drawSeqLabel(ctx, seqId, labelW, siteSize, cnvScale)
    if (seq !== undefined) drawSites(ctx, seq, deltaX, cnvScale, renderedSites)
  }
}

onMount(() => {
  const cnv = document.getElementById(
    `${uid}-seqview-canvas`
  ) as HTMLCanvasElement
  ctx = cnv.getContext('2d') as CanvasRenderingContext2D
  ctx.canvas.style.minWidth = `${minW}px`
  ctx.canvas.style.minHeight = `${minH}px`
})

onDestroy(() => {})

$: renderedSites = prepareSiteImages(siteSize, cnvScale)
$: deltaX = siteSize + siteGapX
$: deltaY = siteSize + siteGapY
$: draw(
  ctx,
  cnvW,
  cnvH,
  minW,
  minH,
  deltaX,
  deltaY,
  cnvScale,
  siteSize,
  seqId,
  seq,
  renderedSites
)
</script>

<div
  class="seqview-element"
  bind:clientWidth="{cnvW}"
  bind:clientHeight="{cnvH}">
  <canvas id="{uid}-seqview-canvas" class="seqview-canvas"></canvas>
</div>

<style>
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
