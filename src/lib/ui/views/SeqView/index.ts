import SeqView from './SeqView.svelte'
export default SeqView

export class Point {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
}

const color_scheme = new Map([
  ['a', 'rgba(255,120,120,1)'],
  ['c', 'rgba(120,120,255,1)'],
  ['g', 'rgba(251,231,2,1)'],
  ['t', 'rgba(0,255,0,1)'],
  ['n', 'rgba(200,200,200,1)'],
  ['-', 'rgba(255,255,255,1)']
])

export function calcTextOffset(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number
): Point {
  const m = ctx.measureText(text)
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
  const x = (size - w) / 2
  const y = (size - h) / 2
  return new Point(x + m.actualBoundingBoxLeft, y + m.actualBoundingBoxAscent)
}

export function drawSite(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number
) {
  const text_offset = calcTextOffset(ctx, text, size)
  if (color_scheme.has(text)) {
    ctx.fillStyle = color_scheme.get(text) as string
  } else {
    ctx.fillStyle = '#fff'
  }
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#000'
  ctx.fillText(text, text_offset.x, text_offset.y)
}

export function prepareSiteImages(
  size: number,
  font: string
): Map<string, HTMLCanvasElement> {
  const renderedSites: Map<string, HTMLCanvasElement> = new Map()
  for (let [key] of color_scheme) {
    const buffer = document.createElement('canvas')
    buffer.width = size
    buffer.height = size
    const ctx = buffer.getContext('2d') as CanvasRenderingContext2D
    // ctx.font = `normal ${size}px ${font}`
    ctx.font = font
    drawSite(ctx, key, size)
    renderedSites.set(key, buffer)
  }
  return renderedSites
}
