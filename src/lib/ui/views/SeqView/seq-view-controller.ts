import { SeqList } from '$lib/seq/seq-list'
import { Alignment } from '$lib/seq/aln'
import { floor, max, min } from '$lib'
import {
  colorSchemeNT,
  colorSchemeAA,
  prepareSiteImages,
  setCnvSize,
  drawScale,
  drawSeqLabel,
  drawSites
} from '.'

export class SeqViewController {
  private _data: SeqList | Alignment
  private _ctx: CanvasRenderingContext2D
  private _siteSize: number = 0
  private _cnvScale: number = 0
  private _renderedSitesNT: Map<string, HTMLCanvasElement> = new Map()
  private _renderedSitesAA: Map<string, HTMLCanvasElement> = new Map()
  private _labelW: number = 0
  private _siteGapX: number = 0
  private _siteGapY: number = 0
  private _deltaX: number = 0
  private _deltaY: number = 0
  private _minCnvW: number = 0
  private _minCnvH: number = 0
  private _cnvW: number = 0
  private _cnvH: number = 0

  private _offScrCnv: HTMLCanvasElement
  private _offScrCtx: CanvasRenderingContext2D

  private _offsetX: number = 0
  private _offsetY: number = 0

  // private _deltaRowOffset: number = -1
  private _rowOffset: number = 0

  // private _deltaColOffset: number = -1
  private _colOffset: number = 0

  private _loadNCol: number = 1
  private _loadNRow: number = 1
  private _slice: string[][] = []

  private _cnvSizeSet: boolean = false
  private _scaleH: number = 0
  private _lineW: number = 0

  private _scaleDrawn: boolean = false
  private _scaleCtx: CanvasRenderingContext2D
  private _offScrScaleCnv: HTMLCanvasElement
  private _offScrScaleCtx: CanvasRenderingContext2D

  constructor(
    seqCtx: CanvasRenderingContext2D,
    scaleCtx: CanvasRenderingContext2D
  ) {
    this._data = new SeqList([])
    this._ctx = seqCtx
    this._scaleCtx = scaleCtx

    this._offScrCnv = document.createElement('canvas')
    this._offScrCtx = this._offScrCnv.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this._offScrScaleCnv = document.createElement('canvas')
    this._offScrScaleCtx = this._offScrScaleCnv.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this.#addEventListeners()
  }

  #addEventListeners() {
    this.ctx.canvas.addEventListener(
      'wheel',
      this.#handleMouseWheel.bind(this),
      { passive: true }
    )
  }

  #handleMouseWheel(evt: WheelEvent) {
    this.#pan(evt)
  }

  #calcNumVis(cnvWH: number, delta: number, offset: number) {
    return floor((cnvWH - offset) / delta)
  }

  #nColVisible(): number {
    return max(
      0,
      this.#calcNumVis(this.cnvW, this.deltaX, this.labelW + this.siteGapX)
    )
  }

  #nRowVisible(): number {
    return max(0, this.#calcNumVis(this.cnvH, this.deltaY, 0))
  }

  #setCnvSize() {
    setCnvSize(
      this.ctx,
      this.cnvW,
      max(this.cnvH, this._slice.length * this.deltaY),
      this.minCnvW,
      this.minCnvH,
      this.cnvScale
    )
  }

  #drawScale() {
    setCnvSize(
      this._scaleCtx,
      this.cnvW,
      this.scaleH,
      this.minCnvW,
      this.scaleH,
      this.cnvScale
    )

    this._offScrScaleCnv.width =
      this.ctx.canvas.width + this._deltaX * this._loadNCol
    this._offScrScaleCnv.height = this._scaleCtx.canvas.height
    this._offScrScaleCtx.font = this._scaleCtx.font

    this._lineW = 1
    this._offScrScaleCtx.translate(this.labelW * this.cnvScale, 0)
    this._offScrScaleCtx.strokeStyle = '#000000'
    drawScale(
      this._offScrScaleCtx,
      max(this._colOffset - this._loadNCol, 0),
      this._colOffset +
        min(this.#nColVisible() + 1, this.data.nCol - this._colOffset),
      this.siteSize,
      this.deltaX,
      this._lineW,
      this.cnvScale,
      this.scaleH - this._lineW * 3,
      10,
      50
    )
  }

  #drawSlice() {
    if (!this._cnvSizeSet) {
      this.#setCnvSize()
      this._cnvSizeSet = true
    }

    this._offScrCnv.width =
      this.ctx.canvas.width + this._deltaX * this._loadNCol
    this._offScrCnv.height = this.ctx.canvas.height
    this._offScrCtx.font = this.ctx.font

    const labelPadding = this.siteSize * this.cnvScale * 0.25

    for (let i = 0; i < this._slice.length; i++) {
      const row = this._slice[i + this._loadNRow - 1]
      const renderedSites =
        row[1] === 'AA' ? this.renderedSitesAA : this.renderedSitesNT

      let offsetX = 0
      offsetX += drawSeqLabel(
        this._offScrCtx,
        row[0],
        labelPadding,
        this.labelW,
        this.siteSize,
        this.cnvScale
      )

      this._offScrCtx.translate(this.siteGapX * this.cnvScale, 0)
      offsetX += this.siteGapX * this.cnvScale

      offsetX += drawSites(
        this._offScrCtx,
        row[2],
        this.deltaX,
        this.cnvScale,
        renderedSites
      )
      this._offScrCtx.translate(-offsetX, this.deltaY * this.cnvScale)
    }
  }

  draw() {
    this._slice = this.data.slice(
      this._colOffset - this._loadNCol,
      this._colOffset + this.#nColVisible() + this._loadNCol,
      this._rowOffset - this._loadNRow,
      this._rowOffset + this.#nRowVisible() + this._loadNRow
    )

    this.#drawSlice()
    this.ctx.drawImage(this._offScrCnv, 0, 0)

    this.#drawScale()
    this._scaleCtx.drawImage(this._offScrScaleCnv, 0, 0)
  }

  #pan(evt: WheelEvent) {
    const deltaX = floor(evt.deltaX)
    const deltaY = floor(evt.deltaY)

    if (deltaX !== 0) {
      this._cnvSizeSet = false
      this._offsetX += deltaX

      // left edge
      if (this._colOffset <= 0 && this._offsetX <= 0) {
        this._offsetX = 0
        this._colOffset = 0
        // this._deltaColOffset = 0
      }
      // right edge
      else if (
        this._offsetX >= 0 &&
        this.data.nCol - this._colOffset < this.#nColVisible()
      ) {
        this._offsetX = 0
        // this._deltaColOffset = 0
      }
      // forward
      else if (
        Math.sign(deltaX) == 1 &&
        this._offsetX > this._deltaX * this._loadNCol
      ) {
        this._offsetX = 0
        this._colOffset += 1 * this._loadNCol
        // this._deltaColOffset = 1
        this.draw()
      }
      // back
      else if (
        Math.sign(deltaX) == -1 &&
        this._offsetX < -this._deltaX * this._loadNCol
      ) {
        this._offsetX = 0
        this._colOffset -= 1 * this._loadNCol
        // this._deltaColOffset = -1
        this.draw()
      } else {
        // this._deltaColOffset = 0
      }
    }

    if (deltaY !== 0) {
      this._cnvSizeSet = false
      this._offsetY += deltaY

      // top
      if (this._rowOffset <= 0 && this._offsetY <= 0) {
        this._offsetY = 0
        this._rowOffset = 0
        // this._deltaRowOffset = 0
      }
      // bottom
      else if (
        this._offsetY >= 0 &&
        this.data.nRow - this._rowOffset < this.#nRowVisible()
      ) {
        this._offsetY = 0
        // this._deltaRowOffset = 0
      }
      // down
      else if (
        Math.sign(deltaY) == 1 &&
        this._offsetY > this._deltaY * this._loadNRow
      ) {
        this._offsetY = 0
        this._rowOffset += 1 * this._loadNRow
        // this._deltaRowOffset = 1
        this.draw()
      }
      // up
      else if (
        Math.sign(deltaY) == -1 &&
        this._offsetY < -this._deltaY * this._loadNRow
      ) {
        this._offsetY = 0
        this._rowOffset -= 1 * this._loadNRow
        // this._deltaRowOffset = -1
        this.draw()
      } else {
        // this._deltaRowOffset = 0
      }
    }
  }

  #prepareSiteImages() {
    this._renderedSitesNT = prepareSiteImages(
      this.siteSize,
      this.cnvScale,
      colorSchemeNT
    )
    this._renderedSitesAA = prepareSiteImages(
      this.siteSize,
      this.cnvScale,
      colorSchemeAA
    )
  }

  #calcDeltaX() {
    this._deltaX = this.siteSize + this.siteGapX
  }

  #calcDeltaY() {
    this._deltaY = this.siteSize + this.siteGapY
  }

  public get renderedSitesNT(): Map<string, HTMLCanvasElement> {
    return this._renderedSitesNT
  }

  public get renderedSitesAA(): Map<string, HTMLCanvasElement> {
    return this._renderedSitesAA
  }

  public get ctx(): CanvasRenderingContext2D {
    return this._ctx
  }

  public get minCnvW(): number {
    return this._minCnvW
  }

  public get minCnvH(): number {
    return this._minCnvH
  }

  public get deltaX(): number {
    return this._deltaX
  }

  public get deltaY(): number {
    return this._deltaY
  }

  public get siteGapX(): number {
    return this._siteGapX
  }

  public set siteGapX(siteGapX: number) {
    this._siteGapX = siteGapX
    this.#calcDeltaX()
  }

  public get siteGapY(): number {
    return this._siteGapY
  }

  public set siteGapY(siteGapY: number) {
    this._siteGapY = siteGapY
    this.#calcDeltaY()
  }

  public get siteSize(): number {
    return this._siteSize
  }

  public set siteSize(siteSize: number) {
    this._siteSize = siteSize
    this._minCnvW = siteSize * 2
    this._minCnvH = siteSize * 2
    this.#calcDeltaX()
    this.#calcDeltaY()
    this.#prepareSiteImages()
  }

  public get cnvScale(): number {
    return this._cnvScale
  }

  public set cnvScale(cnvScale: number) {
    this._cnvScale = cnvScale
    this.#prepareSiteImages()
  }

  public get cnvW(): number {
    return this._cnvW
  }

  public set cnvW(cnvW: number) {
    this._cnvW = cnvW
    this._colOffset = max(
      0,
      min(this._colOffset, this.data.nCol - this.#nColVisible() + 1)
    )
    this._cnvSizeSet = false
  }

  public get cnvH(): number {
    return this._cnvH
  }

  public set cnvH(cnvH: number) {
    this._cnvH = cnvH
    this._rowOffset = max(
      0,
      min(this._rowOffset, this.data.nRow - this.#nRowVisible() + 1)
    )
    this._cnvSizeSet = false
  }

  public get scaleH(): number {
    return this._scaleH
  }

  public set scaleH(scaleH: number) {
    this._scaleH = scaleH
    this._cnvSizeSet = false
  }

  public get labelW(): number {
    return this._labelW
  }

  public set labelW(labelW: number) {
    this._labelW = labelW
    this._cnvSizeSet = false
  }

  public get data(): SeqList | Alignment {
    return this._data
  }

  public set data(data: SeqList | Alignment) {
    this._data = data
  }
}
