import { SeqList } from '$lib/seq/seq-list'
import { Alignment } from '$lib/seq/aln'
import {
  colorSchemeNT,
  colorSchemeAA,
  prepareSiteImages,
  setCnvSize,
  drawScale,
  drawSeqLabel,
  drawSites,
  xAlignment
} from '.'

import { gSysInfo } from '$lib/backend/system-info'

const floor = Math.floor
const max = Math.max
const min = Math.min

export class SeqViewController {
  private _data: SeqList | Alignment
  private _seqCtx: CanvasRenderingContext2D
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

  private _offScrSeqCnv: HTMLCanvasElement
  private _offScrSeqCtx: CanvasRenderingContext2D

  private _offsetX: number = 0
  private _offsetY: number = 0

  private _rowOffset: number = 0
  private _colOffset: number = 0

  private _slice: string[][] = []

  private _cnvSizeSet: boolean = false
  private _scaleH: number = 0
  private _lineW: number = 0

  private _scaleCtx: CanvasRenderingContext2D
  private _offScrScaleCnv: HTMLCanvasElement
  private _offScrScaleCtx: CanvasRenderingContext2D

  private _seqLabCtx: CanvasRenderingContext2D
  private _offScrSeqLabCnv: HTMLCanvasElement
  private _offScrSeqLabCtx: CanvasRenderingContext2D

  private _locale: string = 'en-US'

  constructor(
    scaleCtx: CanvasRenderingContext2D,
    seqLabCtx: CanvasRenderingContext2D,
    seqCtx: CanvasRenderingContext2D
  ) {
    this._data = new SeqList([])
    this._seqCtx = seqCtx
    this._scaleCtx = scaleCtx
    this._seqLabCtx = seqLabCtx

    this._offScrSeqCnv = document.createElement('canvas')
    this._offScrSeqCtx = this._offScrSeqCnv.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this._offScrScaleCnv = document.createElement('canvas')
    this._offScrScaleCtx = this._offScrScaleCnv.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this._offScrSeqLabCnv = document.createElement('canvas')
    this._offScrSeqLabCtx = this._offScrSeqLabCnv.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this.#addEventListeners()
    this._locale = gSysInfo.locale
  }

  #addEventListeners() {
    this._scaleCtx.canvas.addEventListener(
      'wheel',
      this.#handleMouseWheel.bind(this),
      { passive: true }
    )
    this._seqLabCtx.canvas.addEventListener(
      'wheel',
      this.#handleMouseWheel.bind(this),
      { passive: true }
    )
    this._seqCtx.canvas.addEventListener(
      'wheel',
      this.#handleMouseWheel.bind(this),
      { passive: true }
    )
  }

  removeEventListeners() {
    this._scaleCtx.canvas.removeEventListener(
      'wheel',
      this.#handleMouseWheel.bind(this),
      false
    )
    this._seqLabCtx.canvas.removeEventListener(
      'wheel',
      this.#handleMouseWheel.bind(this),
      false
    )
    this._seqCtx.canvas.removeEventListener(
      'wheel',
      this.#handleMouseWheel.bind(this),
      false
    )
  }

  #handleMouseWheel(evt: WheelEvent) {
    this.#pan(evt)
  }

  #calcNumVis(cnvWH: number, delta: number, offset: number) {
    return floor((cnvWH - offset) / delta)
  }

  #nColVisible(): number {
    return max(0, this.#calcNumVis(this.cnvW, this.deltaX, this.siteGapX))
  }

  #nRowVisible(): number {
    return max(0, this.#calcNumVis(this.cnvH, this.deltaY, 0))
  }

  #setCnvSize() {
    setCnvSize(
      this._seqCtx,
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

    if (this._scaleH >= this.minCnvH) {
      this._offScrScaleCnv.width = this._seqCtx.canvas.width + this._deltaX
      this._offScrScaleCnv.height = this._scaleCtx.canvas.height
      this._offScrScaleCtx.font = this._scaleCtx.font

      this._lineW = 1
      this._offScrScaleCtx.strokeStyle = '#000000'
      drawScale(
        this._offScrScaleCtx,
        max(this._colOffset, 0),
        this._colOffset +
          min(this.#nColVisible() + 1, this.data.nCol - this._colOffset),
        this.siteSize,
        this.deltaX,
        this._lineW,
        this.cnvScale,
        this.scaleH,
        5,
        25
      )
    } else {
      this._scaleCtx.reset()
    }
    this._scaleCtx.drawImage(this._offScrScaleCnv, 0, 0)
  }

  #drawSeqLabels() {
    setCnvSize(
      this._seqLabCtx,
      this.labelW,
      max(this.cnvH, this._slice.length * this.deltaY),
      this.minCnvW,
      this.minCnvH,
      this.cnvScale
    )

    this._offScrSeqLabCnv.width = this._seqLabCtx.canvas.width
    this._offScrSeqLabCnv.height = this._seqLabCtx.canvas.height
    this._offScrSeqLabCtx.font = this._seqLabCtx.font

    const labelPadding = this.siteSize * this.cnvScale * 0.25

    for (let i = 0; i < this._slice.length; i++) {
      const row = this._slice[i]
      const seqNumW = min(this.siteSize * 2, this.labelW)

      let offsetX = 0

      // draw sequence label
      offsetX += drawSeqLabel(
        this._offScrSeqLabCtx,
        row[0],
        labelPadding,
        this.labelW,
        this.siteSize,
        this.cnvScale
      )

      const offsetXOld = offsetX
      this._offScrSeqLabCtx.translate(-offsetX, 0)

      // draw sequence order number
      offsetX += drawSeqLabel(
        this._offScrSeqLabCtx,
        (i + this._rowOffset + 1).toLocaleString(this._locale),
        labelPadding,
        seqNumW,
        this.siteSize,
        this.cnvScale,
        xAlignment.right,
        '#EDEDED',
        '#000000',
        0.9
      )

      this._offScrSeqLabCtx.translate(
        offsetXOld - offsetX,
        this.deltaY * this.cnvScale
      )
    }

    this._seqLabCtx.drawImage(this._offScrSeqLabCnv, 0, 0)
  }

  #drawSlice() {
    if (!this._cnvSizeSet) {
      this.#setCnvSize()
      this._cnvSizeSet = true
    }

    this._offScrSeqCnv.width = this._seqCtx.canvas.width + this._deltaX
    this._offScrSeqCnv.height = this._seqCtx.canvas.height
    this._offScrSeqCtx.font = this._seqCtx.font

    for (let i = 0; i < this._slice.length; i++) {
      const row = this._slice[i]
      const renderedSites =
        row[1] === 'AA' ? this.renderedSitesAA : this.renderedSitesNT

      let offsetX = 0

      offsetX += drawSites(
        this._offScrSeqCtx,
        row[2],
        this.deltaX,
        this.cnvScale,
        renderedSites
      )
      this._offScrSeqCtx.translate(-offsetX, this.deltaY * this.cnvScale)
    }

    this._seqCtx.drawImage(this._offScrSeqCnv, 0, 0)
  }

  draw() {
    this._slice = this.data.slice(
      this._colOffset,
      this._colOffset + this.#nColVisible() + 1,
      this._rowOffset,
      this._rowOffset + this.#nRowVisible() + 1
    )

    this.#drawSlice()
    this.#drawScale()
    this.#drawSeqLabels()
  }

  #pan(evt: WheelEvent) {
    const target: HTMLCanvasElement = evt.target as HTMLCanvasElement
    const deltaX = floor(evt.deltaX)
    const deltaY = floor(evt.deltaY)

    if (deltaX !== 0) {
      if (target.id !== this._seqLabCtx.canvas.id) {
        this._cnvSizeSet = false
        this._offsetX += deltaX

        // left edge
        if (this._colOffset <= 0 && this._offsetX <= 0) {
          this._offsetX = 0
          this._colOffset = 0
        }
        // right edge
        else if (
          this._offsetX >= 0 &&
          this.data.nCol - this._colOffset <= this.#nColVisible()
        ) {
          this._offsetX = 0
        }
        // forward
        else if (Math.sign(deltaX) == 1 && this._offsetX > this._deltaX) {
          this._offsetX = 0
          this._colOffset += 1
          this.draw()
        }
        // back
        else if (Math.sign(deltaX) == -1 && this._offsetX < -this._deltaX) {
          this._offsetX = 0
          this._colOffset -= 1
          this.draw()
        }
      }
    }

    if (deltaY !== 0) {
      if (target.id !== this._scaleCtx.canvas.id) {
        this._cnvSizeSet = false
        this._offsetY += deltaY

        // top
        if (this._rowOffset <= 0 && this._offsetY <= 0) {
          this._offsetY = 0
          this._rowOffset = 0
        }
        // bottom
        else if (
          this._offsetY >= 0 &&
          this.data.nRow - this._rowOffset <= this.#nRowVisible()
        ) {
          this._offsetY = 0
        }
        // down
        else if (Math.sign(deltaY) == 1 && this._offsetY > this._deltaY) {
          this._offsetY = 0
          this._rowOffset += 1
          this.draw()
        }
        // up
        else if (Math.sign(deltaY) == -1 && this._offsetY < -this._deltaY) {
          this._offsetY = 0
          this._rowOffset -= 1
          this.draw()
        }
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

  // public get seqCtx(): CanvasRenderingContext2D {
  //   return this._seqCtx
  // }

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
    this._minCnvW = max(siteSize, 1)
    this._minCnvH = max(siteSize, 1)
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
      min(this._colOffset, this.data.nCol - this.#nColVisible())
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
      min(this._rowOffset, this.data.nRow - this.#nRowVisible())
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
