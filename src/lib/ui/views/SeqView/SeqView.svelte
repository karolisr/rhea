<script lang="ts">
import { onMount } from 'svelte'
import { prepareSiteImages } from '.'
export let seq: string | undefined = undefined
export let seqType: string | undefined = undefined

const size = 20

const renderedSites: Map<string, HTMLCanvasElement> = prepareSiteImages(
  size,
  `${size}px Monospace`
)
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

const mar_x = 0
const mar_y = 0
const delta_x = size + mar_x
const delta_y = size + mar_y

function drawSite(label: string, ctx: CanvasRenderingContext2D) {
  ctx.drawImage(renderedSites.get(label) as HTMLCanvasElement, 0, 0)
  ctx.translate(delta_x, 0)
}

function drawSites(
  ctx: CanvasRenderingContext2D | null,
  seq: string | undefined
) {
  if (ctx !== null && seq !== undefined) {
    ctx.reset()
    // ctx.font = '10px JetBrains Mono'
    // ctx.font = `${size}px JetBrains Mono`
    for (let i = 0; i < seq.length; i++) {
      const label = seq[i]
      drawSite(label, ctx)
    }
  }
}

$: drawSites(ctx, seq)

onMount(() => {
  canvas = document.getElementById('seqview-canvas') as HTMLCanvasElement
  ctx = canvas.getContext('2d')
})
</script>

<div class="seqview-container">
  <!-- <div>{seqType}</div> -->
  <!-- <div>{seq}</div> -->
  <canvas id="seqview-canvas"></canvas>
</div>

<!--
<div class="seqview-container">
  <div class="seqview-seq">
    {seq}
  </div>
</div>
-->

<style>
.seqview-container {
  display: flex;
  flex-direction: column;
  background-color: azure;
  overflow-x: scroll;
  /* margin: 0; */
  /* font-family: 'JetBrains Mono'; */
}

#seqview-canvas {
  flex-grow: 1;
  flex-shrink: 1;
  background-color: beige;
  overflow-x: scroll;
  /* margin: 0; */
  /* width: 100px; */
  /* height: 1000px; */
  /* font-family: 'JetBrains Mono'; */
}

/*
.seqview-container {
  display: flex;
  flex-direction: column;
  background-color: azure;
  overflow-x: scroll;
}
.seqview-seq {
  flex-grow: 0;
  background-color: beige;
  font-family: 'JetBrains Mono';
  overflow-x: scroll;
}
*/
</style>
