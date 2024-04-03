import { getPropNames } from '$lib'

declare type KeyToKeyNoIndex<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
}
declare type ValuesOf<T> = T extends { [K in keyof T]: infer U } ? U : never
declare type KnownKeys<T> = ValuesOf<KeyToKeyNoIndex<T>>

export class RecordList<T> extends Array<T> {
  private _sortFields: KnownKeys<T>[]
  private _fieldsToShow: KnownKeys<T>[]
  private _sortDirections: (1 | -1)[]

  constructor(recs: T[]) {
    super(...recs)
    this._sortFields = []
    this._sortDirections = []
    this._fieldsToShow = this.fields
  }

  get fields(): KnownKeys<T>[] {
    if (this.length > 0) {
      return getPropNames(this.at(0)) as KnownKeys<T>[]
    } else {
      return []
    }
  }

  set fieldsToShow(fields: KnownKeys<T>[]) {
    this._fieldsToShow = fields
  }

  get fieldsToShow() {
    return this._fieldsToShow
  }

  get sortFields() {
    return this._sortFields as (keyof T)[]
  }

  get sortDirections() {
    return this._sortDirections
  }

  fieldsByType(type: 'string' | 'number' | 'boolean' | 'object') {
    const rv: KnownKeys<T>[] = []
    if (this.length > 0) {
      const _ = this.at(0) as T
      for (const f of this.fields) {
        if (typeof _[f as keyof T] === type) {
          rv.push(f)
        }
      }
    }
    return rv
  }

  valueByIndex(
    index: number,
    field: keyof T,
    stringValueForObjects: string | undefined = undefined
  ) {
    const rec = this[index] as T
    const rv = rec[field]
    if (stringValueForObjects !== undefined && typeof rv === 'object') {
      return stringValueForObjects
    } else {
      return rv
    }
  }

  sortBy(fields: KnownKeys<T>[], directions: (1 | -1)[]) {
    this._sortFields = fields
    this._sortDirections = directions

    const fs = fields.toReversed()
    const ds = directions.toReversed()

    for (let i = 0; i < fields.length; i++) {
      const f = fs[i]
      const d = ds[i]
      this.sort((a, b) => {
        const x = a[f as keyof T]
        const y = b[f as keyof T]
        if (x === y) return 0
        if (x < y) return -d
        if (x > y) return d
        return 0
      })
    }
  }
}
