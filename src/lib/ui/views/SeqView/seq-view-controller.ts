import type { SeqRecord } from '$lib/seq/seq-record'
import { SeqList } from '$lib/seq/seq-list'
import { Alignment } from '$lib/seq/aln'
import { floor, max } from '$lib'
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

  private _deltaRowOffset: number = -1
  private _rowOffset: number = 0

  private _deltaColOffset: number = -1
  private _colOffset: number = 0

  private _loadNCol: number = 1
  private _slice: string[] = []

  constructor(ctx: CanvasRenderingContext2D) {
    this._data = new SeqList([])
    this._ctx = ctx

    this._offScrCnv = document.createElement('canvas')
    this._offScrCtx = this._offScrCnv.getContext(
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

  #drawSlice() {
    // console.log('DRAW-SLICE')
    setCnvSize(
      this.ctx,
      this.cnvW,
      max(this.cnvH, this._slice.length * this.deltaY),
      this.minCnvW,
      this.minCnvH,
      this.cnvScale
    )

    // const lineW = this.cnvScale * 1
    // const scaleHeight = this.siteSize * 1.5 * this.cnvScale
    // this.ctx.translate(this.labelW * this.cnvScale, 0)
    // this.ctx.strokeStyle = '#5C5C5C'
    // drawScale(
    //   this.ctx,
    //   200,
    //   this.siteSize,
    //   this.deltaX,
    //   lineW,
    //   this.cnvScale,
    //   scaleHeight,
    //   5,
    //   10
    // )
    // this.ctx.translate(-this.labelW * this.cnvScale, scaleHeight + lineW * 1.5)
    // this.ctx.lineWidth = lineW

    // -------
    this._offScrCnv.width =
      this.ctx.canvas.width + this._deltaX * this._loadNCol
    this._offScrCnv.height = this.ctx.canvas.height
    this._offScrCtx.font = this.ctx.font
    // let x = 0
    // let y = 0
    // -------

    const labelPadding = this.siteSize * this.cnvScale * 0.25

    for (let i = 0; i < this._slice.length; i++) {
      const sr = this.data.seqRecs[i]
      const sliceStr = this._slice[i]
      const renderedSites =
        sr.seq.type === 'AA' ? this.renderedSitesAA : this.renderedSitesNT

      let offsetX = 0
      offsetX += drawSeqLabel(
        this._offScrCtx,
        sr.id,
        labelPadding,
        this.labelW,
        this.siteSize,
        this.cnvScale
      )

      this._offScrCtx.translate(this.siteGapX * this.cnvScale, 0)
      offsetX += this.siteGapX * this.cnvScale

      offsetX += drawSites(
        this._offScrCtx,
        sliceStr,
        this.deltaX,
        this.cnvScale,
        renderedSites
      )
      this._offScrCtx.translate(-offsetX, this.deltaY * this.cnvScale)
    }
  }

  draw() {
    // console.log('DRAW')
    this.ctx.translate(-this._deltaColOffset * this._deltaX * this._loadNCol, 0)

    if (this._colOffset > 0) {
      this.ctx.translate(-this._deltaX * this._loadNCol, 0)
    }

    // if (this._deltaColOffset != 0) {
    this._slice = this.data.slice(
      this._colOffset - this._loadNCol,
      this._colOffset + this.#nColVisible() + this._loadNCol + 1,
      0,
      this.#nRowVisible()
    )
    this.#drawSlice()
    // }
    this.ctx.drawImage(this._offScrCnv, 0, 0)
  }

  #pan(evt: WheelEvent) {
    const deltaX = floor(evt.deltaX)
    const deltaY = floor(evt.deltaY)

    if (evt.deltaX !== 0) {
      this._offsetX += deltaX

      // left edge
      if (this._colOffset <= 0 && this._offsetX <= 0) {
        this._offsetX = 0
        this._colOffset = 0
        this._deltaColOffset = 0
        // this.draw()
      }
      // right edge
      else if (
        this._offsetX >= 0 &&
        1000 - this._colOffset <= this.#nColVisible()
      ) {
        this._offsetX = 0
        this._deltaColOffset = 0
        // this.draw()
      }
      // forward
      else if (
        Math.sign(deltaX) == 1 &&
        this._offsetX > this._deltaX * this._loadNCol
      ) {
        this._offsetX = 0
        this._colOffset += 1 * this._loadNCol
        this._deltaColOffset = 1
        this.draw()
      }
      // back
      else if (
        Math.sign(deltaX) == -1 &&
        this._offsetX < -this._deltaX * this._loadNCol
      ) {
        this._offsetX = 0
        this._colOffset -= 1 * this._loadNCol
        this._deltaColOffset = -1
        this.draw()
      } else {
        this._deltaColOffset = 0
        // this._offsetX = 0
      }
    }

    if (deltaY !== 0) {
      // console.log(deltaY)
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
    this._minCnvW = siteSize
    this._minCnvH = siteSize
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
  }

  public get cnvH(): number {
    return this._cnvH
  }

  public set cnvH(cnvH: number) {
    this._cnvH = cnvH
  }

  public get labelW(): number {
    return this._labelW
  }

  public set labelW(labelW: number) {
    this._labelW = labelW
  }

  public get data(): SeqList | Alignment {
    return this._data
  }

  public set data(data: SeqList | Alignment) {
    this._data = data
  }

  // draw() {
  //   if (this.ctx !== null) {
  //     const labelPadding = this.siteSize * this.cnvScale * 0.25
  //     setCnvSize(
  //       this.ctx,
  //       this.cnvW,
  //       max(this.cnvH, this.seqRecords.length * this.deltaY),
  //       this.minCnvW,
  //       this.minCnvH,
  //       this.cnvScale
  //     )
  //     const lineW = this.cnvScale * 1

  //     const scaleHeight = this.siteSize * 1.5 * this.cnvScale
  //     this.ctx.translate(this.labelW * this.cnvScale, 0)
  //     this.ctx.strokeStyle = '#5C5C5C'
  //     drawScale(
  //       this.ctx,
  //       200,
  //       this.siteSize,
  //       this.deltaX,
  //       lineW,
  //       this.cnvScale,
  //       scaleHeight,
  //       5,
  //       10
  //     )
  //     this.ctx.translate(
  //       -this.labelW * this.cnvScale,
  //       scaleHeight + lineW * 1.5
  //     )

  //     this.ctx.lineWidth = lineW

  //     for (let i = 0; i < this.seqRecords.length; i++) {
  //       const sr = this.seqRecords[i]
  //       const renderedSites =
  //         sr.seq.type === 'AA' ? this.renderedSitesAA : this.renderedSitesNT

  //       let offsetX = 0
  //       offsetX += drawSeqLabel(
  //         this.ctx,
  //         sr.id,
  //         labelPadding,
  //         this.labelW,
  //         this.siteSize,
  //         this.cnvScale
  //       )

  //       this.ctx.translate(this.siteGapX * this.cnvScale, 0)
  //       offsetX += this.siteGapX * this.cnvScale

  //       offsetX += drawSites(
  //         this.ctx,
  //         sr.seq.str,
  //         this.deltaX,
  //         this.cnvScale,
  //         renderedSites
  //       )
  //       this.ctx.translate(-offsetX, this.deltaY * this.cnvScale)
  //     }
  //   }
  // }
}
