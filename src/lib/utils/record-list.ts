import { getPropNames } from '$lib'
// import { type Readable } from 'svelte/store'
// import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
// import { type DBMain } from '$lib/app/db/types'

declare type KeyToKeyNoIndex<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
}
declare type ValuesOf<T> = T extends { [K in keyof T]: infer U } ? U : never
declare type KnownKeys<T> = ValuesOf<KeyToKeyNoIndex<T>>

export class RecordList<T> {
  private _sortFields: KnownKeys<T>[]
  private _fieldsToShow: KnownKeys<T>[] | undefined
  private _sortDirections: (1 | -1)[]
  private _keyField: keyof T
  private _allItems: T[]
  private _filterField: keyof T
  private _filterQuery: T[typeof this._filterField] | undefined

  constructor(items: T[], keyField: KnownKeys<T>) {
    this._allItems = items
    this._keyField = keyField as keyof T
    this._filterField = this.keyField
    this._sortFields = []
    this._sortDirections = []
  }

  get items() {
    if (this._filterQuery === undefined) {
      return this._allItems
    } else {
      const rv: T[] = []
      this._allItems.forEach((itm) => {
        if (itm[this._filterField] === this._filterQuery) rv.push(itm)
      })
      return rv
    }
  }

  filterBy(field: KnownKeys<T>, query: T[keyof T]) {
    this._filterField = field as keyof T
    this._filterQuery = query as T[typeof this._filterField]
  }

  get length() {
    return this.items.length
  }

  get keyField() {
    return this._keyField
  }

  get fields(): KnownKeys<T>[] {
    if (this.length > 0) {
      return getPropNames(this.items.at(0)) as KnownKeys<T>[]
    } else {
      return []
    }
  }

  set fieldsToShow(fields: KnownKeys<T>[]) {
    this._fieldsToShow = fields
  }

  get fieldsToShow() {
    if (this._fieldsToShow !== undefined) {
      return this._fieldsToShow
    } else {
      return this.fields
    }
  }

  get sortFields() {
    return this._sortFields as (keyof T)[]
  }

  get sortDirections() {
    return this._sortDirections
  }

  fieldsByType(
    types: (
      | 'string'
      | 'number'
      | 'boolean'
      | 'object'
      | 'bigint'
      | 'symbol'
      | 'undefined'
      | 'function'
    )[]
  ) {
    const rv: KnownKeys<T>[] = []
    if (this.length > 0) {
      const _ = this._allItems.at(0) as T
      for (const f of this.fields) {
        if (types.includes(typeof _[f as keyof T])) {
          rv.push(f)
        }
      }
    }
    return rv
  }

  stringValueByIndex(index: number, field: keyof T) {
    return this.valueByIndex(index, field, '') as string
  }

  valueByIndex(
    index: number,
    field: keyof T,
    stringValueForObjects: string | undefined = undefined
  ) {
    const rec = this.items.at(index) as T
    if (rec) {
      const rv = rec[field]
      if (stringValueForObjects !== undefined && typeof rv === 'object') {
        return stringValueForObjects as string
      } else {
        return rv
      }
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
      this._allItems.sort((a, b) => {
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
