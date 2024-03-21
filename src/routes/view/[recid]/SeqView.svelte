<script lang="ts">
import type { GBSeq } from '$lib/ncbi/types/gbseq'
import { onMount, onDestroy } from 'svelte'
import { scaleLinear, type ScaleLinear } from 'd3-scale'

export let rec: GBSeq

let width: number = 0
let height: number = 0
let s: ScaleLinear<number, number, number>
let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let hRow = 40

function drawTicks(every: number, length: number) {
  every = s(every)
  length = s(length)
  const y = 0
  ctx.strokeStyle = '#DFDFDF'
  ctx.beginPath()
  for (let i = every; i < length; i += every) {
    ctx.moveTo(i, y)
    ctx.lineTo(i, y + hRow)
    ctx.stroke()
  }
  ctx.closePath()
}

function drawAnnot(from: number, to: number) {
  from = s(from)
  to = s(to)
  const wArrow = hRow / 4
  const y = hRow

  const b = from
  const e = to
  let rev = 1

  if (b < e) {
    ctx.strokeStyle = 'black'
    ctx.fillStyle = 'rgba(0,240,0,0.55)'
  } else {
    ctx.strokeStyle = 'black'
    ctx.fillStyle = 'rgba(240,0,0,0.55)'
    rev = -1
  }

  const w = to - from
  ctx.fillRect(from, 0, w - Math.sign(from) * wArrow * rev, y)
  // ctx.strokeRect(from, 0, w, y)

  ctx.beginPath()
  ctx.moveTo(to - Math.sign(from) * wArrow * rev, 0)
  ctx.lineTo(to, y / 2)
  ctx.lineTo(to - Math.sign(from) * wArrow * rev, y)
  ctx.closePath()
  ctx.fill()
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 1
  drawTicks(Math.round(rec.GBSeq_length / 50), rec.GBSeq_length)
  ctx.lineWidth = 1
  rec.GBSeq_feature_table.GBFeature.forEach((f) => {
    if (f.GBFeature_key === 'CDS') {
      f.GBFeature_intervals.GBInterval.forEach((i) => {
        drawAnnot(i.GBInterval_from, i.GBInterval_to)
      })
    }
  })
}

function scale() {
  // width = rec.GBSeq_length * 2
  width = window.innerWidth * 2 - 80
  height = hRow
  canvas.width = width
  canvas.height = height
  canvas.style.width = `${width / 2}px`
  canvas.style.height = `${height / 2}px`

  s = scaleLinear([0, rec.GBSeq_length], [0, width])
}

function onResize(ev: UIEvent) {
  scale()
  draw()
}

onMount(() => {
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  window.addEventListener('resize', onResize)
  scale()
  draw()
})

onDestroy(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<div>
  <canvas bind:this="{canvas}"></canvas>
</div>

<style>
div {
  background-color: orangered;
  overflow: hidden;
  /* overflow-x: scroll; */
}

canvas {
  background-color: snow;
}
</style>
