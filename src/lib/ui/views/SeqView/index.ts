import SeqView from './SeqView.svelte'
import { max, min } from '$lib'

export default SeqView

export class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

export enum xAlignment {
  left = 0,
  center = 1,
  right = 2
}

const color_scheme = new Map([
  ['A', 'rgba(255,120,120,1)'],
  ['C', 'rgba(120,120,255,1)'],
  ['G', 'rgba(251,231,2,1)'],
  ['T', 'rgba(0,255,0,1)'],
  ['U', 'rgba(0,255,0,1)'],
  ['N', 'rgba(200,200,200,1)'],
  ['-', 'rgba(255,255,255,1)']
])

export function setCnvSize(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  minW: number,
  minH: number,
  cnvScale: number
) {
  w = max(minW, w)
  h = max(minH, h)
  ctx.canvas.width = w * cnvScale
  ctx.canvas.height = h * cnvScale
  ctx.canvas.style.width = `${w}px`
  ctx.canvas.style.height = `${h}px`
  ctx.reset()
}

export function calcTextOffset(
  ctx: CanvasRenderingContext2D,
  text: string,
  sizeX: number,
  sizeY: number,
  xAlign: xAlignment = xAlignment.center
): Point {
  const m = ctx.measureText(text)
  const w = m.width
  const h = m.fontBoundingBoxAscent + m.ideographicBaseline

  let x: number = 0
  const topOffset = (sizeY + h) / 2
  switch (xAlign) {
    case xAlignment.left:
      return new Point(0, topOffset)

    case xAlignment.center:
      x = (sizeX - w) / 2
      return new Point(x, topOffset)

    case xAlignment.right:
      return new Point(sizeX - w, topOffset)

    default:
      return new Point(0, 0)
  }
}

export function prepareSiteImage(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  xAlign: xAlignment
) {
  const text_offset = calcTextOffset(
    ctx,
    text.toUpperCase(),
    size,
    size,
    xAlign
  )
  if (color_scheme.has(text)) {
    ctx.fillStyle = color_scheme.get(text) as string
  } else {
    ctx.fillStyle = '#fff'
  }
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000'
  ctx.fillText(text.toUpperCase(), text_offset.x, text_offset.y)
}

export function prepareSiteImages(
  size: number,
  cnvScale: number
): Map<string, HTMLCanvasElement> {
  const renderedSites: Map<string, HTMLCanvasElement> = new Map()
  for (let [key] of color_scheme) {
    const buffer = document.createElement('canvas')
    const ctx = buffer.getContext('2d') as CanvasRenderingContext2D
    buffer.width = size * cnvScale
    buffer.height = size * cnvScale
    ctx.reset()
    ctx.scale(cnvScale, cnvScale)
    ctx.font = `${max(size - 3, 14)}px sans-serif`
    prepareSiteImage(ctx, key, size, xAlignment.center)
    renderedSites.set(key, buffer)
  }
  return renderedSites
}

export function drawSeqLabel(
  ctx: CanvasRenderingContext2D,
  label: string,
  labelPadding: number,
  sizeX: number,
  sizeY: number,
  cnvScale: number
): number {
  ctx.font = `${max(sizeY - 5, 12) * cnvScale}px monospace`
  const textOffset = calcTextOffset(
    ctx,
    label,
    sizeX * cnvScale - labelPadding,
    sizeY * cnvScale,
    xAlignment.right
  )
  ctx.fillStyle = '#F5F5F5'
  ctx.fillRect(0, 0, sizeX * cnvScale, sizeY * cnvScale)
  ctx.fillStyle = '#000'
  ctx.fillText(label, textOffset.x, textOffset.y)
  const offsetX = sizeX * cnvScale
  ctx.translate(offsetX, 0)
  return offsetX
}

export function drawSite(
  ctx: CanvasRenderingContext2D,
  label: string,
  renderedSites: Map<string, HTMLCanvasElement>
) {
  label = label.toUpperCase()
  if (!renderedSites.has(label)) return
  ctx.drawImage(renderedSites.get(label) as HTMLCanvasElement, 0, 0)
}

export function drawSites(
  ctx: CanvasRenderingContext2D,
  seq: string,
  deltaX: number,
  cnvScale: number,
  renderedSites: Map<string, HTMLCanvasElement>
): number {
  let totalOffsetX = 0
  for (let i = 0; i < min(seq.length, 30); i++) {
    const label = seq[i]
    drawSite(ctx, label, renderedSites)
    const offsetX = deltaX * cnvScale
    ctx.translate(offsetX, 0)
    totalOffsetX += offsetX
  }
  return totalOffsetX
}

export function drawScale(
  ctx: CanvasRenderingContext2D,
  nSites: number,
  siteSize: number,
  deltaX: number,
  lineW: number,
  cnvScale: number,
  height: number,
  minorTicksEvery: number,
  majorTicksEvery: number
) {
  ctx.font = `normal ${height / 2.75}px Monospace`
  for (let i = 1; i < nSites + 1; i++) {
    const x = i * deltaX * cnvScale + ((deltaX - siteSize) * cnvScale) / 2
    if (i % majorTicksEvery === 0) {
      const labOffset = calcTextOffset(
        ctx,
        String(i),
        deltaX * 2 * cnvScale,
        height / 3
      )
      ctx.fillText(
        String(i),
        x + labOffset.x - deltaX * cnvScale,
        labOffset.y + height / 10
      )
      ctx.lineWidth = lineW * 2
      ctx.beginPath()
      ctx.moveTo(x, height / 1.75)
      ctx.lineTo(x, height)
      ctx.stroke()
    } else if (i % minorTicksEvery === 0) {
      ctx.lineWidth = lineW
      ctx.beginPath()
      ctx.moveTo(x, height / 1.5)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }

  ctx.lineWidth = lineW
  ctx.beginPath()
  ctx.moveTo((deltaX - siteSize) * cnvScale, height)
  ctx.lineTo(nSites * deltaX * cnvScale, height)
  ctx.stroke()
}
