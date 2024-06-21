<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { max } from '$lib'
import { prepareSiteImages } from '.'

export let seq: string | undefined = undefined
export let seqType: string | undefined = undefined

let cnv: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

let width: number
let height: number

let minW: number = 20
let minH: number = 20

const cnvScale: number = 4

const siteSize = 19

const renderedSites: Map<string, HTMLCanvasElement> = prepareSiteImages(
  siteSize,
  cnvScale
)

const mar_x = 0
const mar_y = 0
const delta_x = siteSize + mar_x
const delta_y = siteSize + mar_y

function drawSite(label: string, ctx: CanvasRenderingContext2D) {
  ctx.drawImage(renderedSites.get(label) as HTMLCanvasElement, 0, 0)
  ctx.translate(delta_x * cnvScale, 0)
}

function drawSites(
  ctx: CanvasRenderingContext2D | null,
  seq: string | undefined
) {
  if (ctx !== null && seq !== undefined) {
    setCnvSize(width, height)
    for (let i = 0; i < seq.length; i++) {
      const label = seq[i]
      drawSite(label, ctx)
    }
  }
}

function setCnvSize(w: number, h: number) {
  if (cnv && ctx) {
    w = max(minW, w)
    h = max(minH, h)
    ctx.canvas.width = w * cnvScale
    ctx.canvas.height = h * cnvScale
    cnv.style.width = `${w}px`
    cnv.style.height = `${h}px`
    ctx.reset()
  }
}

$: setCnvSize(width, height)
$: drawSites(ctx, seq)

onMount(() => {
  cnv = document.getElementById('seqview-canvas') as HTMLCanvasElement
  ctx = cnv.getContext('2d') as CanvasRenderingContext2D
  cnv.style.minWidth = `${minW}px`
  cnv.style.minHeight = `${minH}px`
})

onDestroy(() => {})
</script>

<div
  class="seqview-container"
  bind:clientWidth="{width}"
  bind:clientHeight="{height}">
  <canvas id="seqview-canvas"></canvas>
</div>

<style>
.seqview-container {
  overflow-x: hidden;
  overflow-y: hidden;
}
/* canvas {
  background-color: pink;
} */
</style>
