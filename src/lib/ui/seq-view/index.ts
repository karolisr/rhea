import _SeqView from './SeqView.svelte'
export const SeqView = _SeqView

// const floor = Math.floor
const max = Math.max
// const min = Math.min

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

export const colorSchemeNT = new Map([
  ['A', 'rgba(255,120,120,1)'],
  ['C', 'rgba(120,120,255,1)'],
  ['G', 'rgba(251,231,2,1)'],
  ['T', 'rgba(0,255,0,1)'],
  ['U', 'rgba(0,255,0,1)'],
  ['N', 'rgba(200,200,200,1)'],
  ['-', 'rgba(255,255,255,1)'],
  ['.', 'rgba(255,255,255,1)']
])

export const colorSchemeAA = new Map([
  ['A', 'rgba(179,179,179,1)'],
  ['C', 'rgba(255,230,0,1)'],
  ['D', 'rgba(255,109,115,1)'],
  ['E', 'rgba(255,0,255,1)'],
  ['F', 'rgba(242,230,126,1)'],
  ['G', 'rgba(137,204,0,1)'],
  ['H', 'rgba(255,132,0,1)'],
  ['I', 'rgba(0,201,116,1)'],
  ['K', 'rgba(111,208,255,1)'],
  ['L', 'rgba(255,38,137,1)'],
  ['M', 'rgba(255,0,255,1)'],
  ['N', 'rgba(0,255,255,1)'],
  ['P', 'rgba(255,255,0,1)'],
  ['Q', 'rgba(61,188,255,1)'],
  ['R', 'rgba(100,228,230,1)'],
  ['S', 'rgba(255,178,158,1)'],
  ['T', 'rgba(255,233,121,1)'],
  ['V', 'rgba(0,255,0,1)'],
  ['W', 'rgba(255,171,173,1)'],
  ['Y', 'rgba(146,255,0,1)'],
  ['X', 'rgba(100,100,100,1)'],
  ['-', 'rgba(255,255,255,1)'],
  ['.', 'rgba(255,255,255,1)'],
  ['*', 'rgba(0,0,0,1)']
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
  xAlign: xAlignment,
  colorScheme: Map<string, string>
) {
  const text_offset = calcTextOffset(
    ctx,
    text.toUpperCase(),
    size,
    size,
    xAlign
  )
  let bg: string = '#fff'
  let fg: string = '#000'
  if (colorScheme.has(text)) {
    bg = colorScheme.get(text) as string
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // ctx.strokeStyle = '#000'
  // ctx.strokeRect(0, 0, size, size)

  if (bg === 'rgba(0,0,0,1)' || bg === 'rgba(100,100,100,1)') {
    fg = '#fff'
  }
  ctx.fillStyle = fg
  ctx.fillText(text.toUpperCase(), text_offset.x, text_offset.y)
}

export function prepareSiteImages(
  size: number,
  cnvScale: number,
  colorScheme: Map<string, string>
): Map<string, HTMLCanvasElement> {
  const renderedSites: Map<string, HTMLCanvasElement> = new Map()
  for (let [key] of colorScheme) {
    const buffer = window.document.createElement('canvas')
    const ctx = buffer.getContext('2d') as CanvasRenderingContext2D
    buffer.width = size * cnvScale
    buffer.height = size * cnvScale
    ctx.reset()
    ctx.scale(cnvScale, cnvScale)
    ctx.font = `${max(size - 3, 14)}px sans-serif`
    prepareSiteImage(ctx, key, size, xAlignment.center, colorScheme)
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
  cnvScale: number,
  xAlign: xAlignment = xAlignment.right,
  bg: string = '#FFFFFF',
  fg: string = '#000000',
  fontScale: number = 1
): number {
  ctx.font = `${max(sizeY - 5, 12) * cnvScale * fontScale}px monospace`
  const textOffset = calcTextOffset(
    ctx,
    label,
    sizeX * cnvScale - labelPadding,
    sizeY * cnvScale,
    xAlign
  )
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, sizeX * cnvScale, sizeY * cnvScale)
  ctx.fillStyle = fg
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
  for (let i = 0; i < seq.length; i++) {
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
  from: number,
  to: number,
  siteSize: number,
  deltaX: number,
  lineW: number,
  cnvScale: number,
  height: number,
  minorTicksEvery: number,
  majorTicksEvery: number
) {
  ctx.font = `normal ${(height * cnvScale) / 2.5}px sans-serif`
  const nSites = to - from
  for (let i = 0; i < nSites; i++) {
    let x = i * deltaX * cnvScale - ((deltaX - siteSize) * cnvScale) / 2
    if (from + i === 0) continue
    if ((from + i) % majorTicksEvery === 0) {
      const labOffset = calcTextOffset(
        ctx,
        String(from + i),
        deltaX * 2 * cnvScale,
        (height * cnvScale) / 2.5
      )
      ctx.fillText(
        String(from + i),
        x + labOffset.x - deltaX * cnvScale,
        labOffset.y + (height * cnvScale) / 10
      )
      ctx.lineWidth = lineW * 2 * cnvScale
      ctx.beginPath()
      ctx.moveTo(x, (height * cnvScale) / 1.7)
      ctx.lineTo(x, height * cnvScale)
      ctx.stroke()
    } else if ((from + i) % minorTicksEvery === 0) {
      ctx.lineWidth = lineW * cnvScale
      ctx.beginPath()
      ctx.moveTo(x, (height * cnvScale) / 1.5)
      ctx.lineTo(x, height * cnvScale)
      ctx.stroke()
    }
  }

  ctx.lineWidth = lineW * cnvScale
  ctx.beginPath()
  ctx.moveTo(
    (deltaX - siteSize - 0.5 * (deltaX - siteSize) - lineW) * cnvScale,
    height * cnvScale
  )
  ctx.lineTo(nSites * deltaX * cnvScale, height * cnvScale)
  ctx.stroke()
}
