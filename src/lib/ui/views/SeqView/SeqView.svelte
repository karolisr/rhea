<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import {
  prepareSiteImages,
  drawScale,
  drawSeqLabel,
  setCnvSize,
  drawSites
} from '.'
import { SeqRecord } from '$lib/seq/seq-record'
import { ceil, floor, max, min } from '$lib'
import { getFontSize } from '$lib/app/api'

export let uid: string

export let seqRecords: SeqRecord[] = []

export let siteSize = ceil(getFontSize() * 1.15)
export let labelW = siteSize * 7
export let siteGapX = 1
export let siteGapY = 1
export let minW: number = labelW + siteSize * 20
export let minH: number = siteSize
export let cnvScale: number = 2

let renderedSites: Map<string, HTMLCanvasElement>

let ctx: CanvasRenderingContext2D | null = null

let cnvW: number
let cnvH: number

let deltaX: number
let deltaY: number

let nRowsVis: number
let nColsVis: number

function calcNumVis(cnvWH: number, delta: number, offset: number) {
  return floor((cnvWH - offset) / delta)
}

function draw(
  seqRecords: SeqRecord[],
  ctx: CanvasRenderingContext2D | null,
  cnvW: number,
  cnvH: number,
  minW: number,
  minH: number,
  deltaX: number,
  deltaY: number,
  cnvScale: number,
  siteSize: number,
  renderedSites: Map<string, HTMLCanvasElement>
) {
  if (ctx !== null) {
    const labelPadding = siteSize * cnvScale * 0.25
    setCnvSize(
      ctx,
      cnvW,
      max(cnvH, seqRecords.length * deltaY),
      minW,
      minH,
      cnvScale
    )
    const lineW = cnvScale * 1

    const scaleHeight = siteSize * 1.5 * cnvScale
    ctx.translate(labelW * cnvScale, 0)
    ctx.strokeStyle = '#5C5C5C'
    drawScale(ctx, 100, siteSize, deltaX, lineW, cnvScale, scaleHeight, 5, 10)
    ctx.translate(-labelW * cnvScale, scaleHeight + lineW * 1.5)

    ctx.lineWidth = lineW

    for (let i = 0; i < seqRecords.length; i++) {
      const sr = seqRecords[i]
      let offsetX = 0
      offsetX += drawSeqLabel(
        ctx,
        sr.id,
        labelPadding,
        labelW,
        siteSize,
        cnvScale
      )

      ctx.translate(siteGapX * cnvScale, 0)
      offsetX += siteGapX * cnvScale

      nRowsVis = max(0, calcNumVis(cnvH, deltaY, 0))
      nColsVis = max(0, calcNumVis(cnvW, deltaX, offsetX / cnvScale))
      // console.log(nRowsVis, nColsVis)

      offsetX += drawSites(ctx, sr.seq.str, deltaX, cnvScale, renderedSites)

      // ctx.moveTo(-offsetX, siteSize * cnvScale + (siteGapY / 2) * cnvScale)
      // ctx.lineTo(
      //   -offsetX + labelW * cnvScale,
      //   siteSize * cnvScale + (siteGapY / 2) * cnvScale
      // )
      // ctx.stroke()

      // ctx.moveTo(-offsetX, siteSize * cnvScale + (siteGapY / 2) * cnvScale)
      // ctx.lineTo(
      //   -siteGapX * cnvScale,
      //   siteSize * cnvScale + (siteGapY / 2) * cnvScale
      // )
      // ctx.stroke()

      ctx.translate(-offsetX, deltaY * cnvScale)
    }
    // ctx.translate(
    //   labelW * cnvScale + (siteGapX / 2) * cnvScale,
    //   -siteGapY * cnvScale
    // )
    // ctx.moveTo(0, 0)
    // ctx.lineTo(0, -deltaY * cnvScale * seqRecords.length)
    // ctx.stroke()
  }
}

onMount(() => {
  const cnv = document.getElementById(
    `${uid}-seqview-canvas`
  ) as HTMLCanvasElement
  ctx = cnv.getContext('2d') as CanvasRenderingContext2D
  // ctx.canvas.style.minWidth = `${minW}px`
  // ctx.canvas.style.minHeight = `${minH}px`
})

onDestroy(() => {})

$: renderedSites = prepareSiteImages(siteSize, cnvScale)
$: deltaX = siteSize + siteGapX
$: deltaY = siteSize + siteGapY
$: draw(
  seqRecords,
  ctx,
  cnvW,
  cnvH,
  minW,
  minH,
  deltaX,
  deltaY,
  cnvScale,
  siteSize,
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
