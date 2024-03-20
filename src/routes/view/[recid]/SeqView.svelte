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

function drawAnnot(from: number, to: number) {
  const y = 2
  const w = Math.max(from, to) - Math.min(from, to)
  ctx.strokeRect(Math.min(from, to), y, w, 5)
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  // console.log(s(0), s(rec.GBSeq_length), rec.GBSeq_length)
  // console.log(height, width)
  // console.log('---')

  rec.GBSeq_feature_table.GBFeature.forEach((f) => {
    if (f.GBFeature_key === 'CDS') {
      f.GBFeature_intervals.GBInterval.forEach((i) => {
        // console.log(s(i.GBInterval_from), s(i.GBInterval_to))
        drawAnnot(s(i.GBInterval_from), s(i.GBInterval_to))
      })
    }
  })

  // ctx.strokeRect(10, 10, width - 20, height - 20)
}

function scale() {
  // console.log(canvas.clientWidth, canvas.clientHeight)
  // console.log(canvas.width, canvas.height)
  // canvas.width = canvas.clientWidth
  // canvas.height = canvas.clientHeight
  // width = canvas.clientWidth
  // height = canvas.clientHeight
  // canvas.width = window.innerWidth
  width = canvas.width
  height = canvas.height
  s = scaleLinear([0, rec.GBSeq_length], [0, width])
}

function onResize(ev: UIEvent) {
  scale()
  draw()
}

onMount(() => {
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.strokeStyle = 'red'
  window.addEventListener('resize', onResize)
  scale()
  draw()
  // rec.GBSeq_feature_table.GBFeature.forEach((f) => {
  //   if (f.GBFeature_key === 'CDS') {
  //     f.GBFeature_intervals.GBInterval.forEach((i) => {
  //       console.log(s(i.GBInterval_from), s(i.GBInterval_to))
  //       // drawAnnot(s(i.GBInterval_from), s(i.GBInterval_to))
  //     })
  //   }
  // })
})

onDestroy(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<!-- <canvas bind:this="{canvas}" bind:clientWidth="{width}" bind:clientHeight="{height}"></canvas> -->
<canvas bind:this="{canvas}"></canvas>

<style>
canvas {
  flex-grow: 1;
  background-color: aliceblue;
}
</style>
