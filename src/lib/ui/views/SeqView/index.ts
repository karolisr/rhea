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

export enum xAlignment {
  left = 0,
  center = 1,
  right = 2
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
  sizeX: number,
  sizeY: number,
  xAlign: xAlignment = xAlignment.center
): Point {
  const m = ctx.measureText(text)
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
  const h = m.actualBoundingBoxAscent + m.alphabeticBaseline

  let x: number = 0
  const y = (sizeY - h) / 2
  const topOffset = y + m.actualBoundingBoxAscent - sizeY / 30
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

export function drawSite(
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
    ctx.font = `normal ${size - 4}px Sans-Serif`
    drawSite(ctx, key, size, xAlignment.center)
    renderedSites.set(key, buffer)
  }
  return renderedSites
}
