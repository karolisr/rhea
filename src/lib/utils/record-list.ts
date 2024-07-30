import type { KnownKeys, SortDir } from '$lib/types'
import { getPropNames } from '$lib'
import { Doc } from '$lib/doc'

export class RecordList<T> {
  private _uid: string
  private _sortFields: KnownKeys<T>[] | string[]
  private _fieldsToShow: KnownKeys<T>[] | string[]
  private _sortDirections: SortDir[]
  private _keyField: keyof T
  private _allItems: T[]
  private _items: T[]
  private _filterField: keyof T
  private _filterQuery: T[typeof this._filterField] | undefined
  private _filterIds: T[typeof this._filterField][] | undefined

  constructor(uid: string, items: T[], keyField: KnownKeys<T> | keyof T) {
    this._uid = uid
    this._allItems = items
    this._items = this._allItems
    this._keyField = keyField as keyof T
    this._filterField = this.keyField
    this._sortFields = []
    this._sortDirections = []
    this._fieldsToShow = []
  }

  private updated() {
    dispatchEvent(new Event(this.updatedEventName))
  }

  public get updatedEventName(): string {
    return `${this._uid}-updated`
  }

  get items() {
    return this._items
  }

  get keys() {
    return this._items.map((x) => x[this.keyField]) as string[]
  }

  get allKeys() {
    return this._allItems.map((x) => x[this.keyField]) as string[]
  }

  get length() {
    return this.items.length
  }

  get keyField() {
    return this._keyField
  }

  get fields(): KnownKeys<T>[] | string[] {
    if (this.length > 0) {
      const _ = this.items.at(0)
      try {
        return (_ as Doc).fields // should be some more generic class, not "Doc"
      } catch (error) {
        return getPropNames(_) as KnownKeys<T>[]
      }
    } else {
      return []
    }
  }

  set fieldsToShow(fields: KnownKeys<T>[] | string[]) {
    this._fieldsToShow = fields
  }

  get fieldsToShow(): KnownKeys<T>[] | string[] {
    if (this._fieldsToShow.length > 0) {
      return this._fieldsToShow as KnownKeys<T>[]
    } else {
      return this.fields as KnownKeys<T>[]
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
  ): KnownKeys<T>[] | string[] {
    const rv: KnownKeys<T>[] = []
    if (this.length > 0) {
      const _ = this._allItems.at(0) as T
      for (const f of this.fields) {
        if (types.includes(typeof _[f as keyof T])) {
          rv.push(f as KnownKeys<T>)
        }
      }
    }
    return rv
  }

  typeByIndex(index: number, field: keyof T) {
    const rec = this.items.at(index) as T
    if (rec) {
      let val = rec[field]
      if (typeof val === 'number') {
        return true
      } else {
        return false
      }
    }
  }

  valueByIndex(
    index: number,
    field: keyof T = this.keyField,
    stringValueForObjects: string | undefined = undefined,
    stringValueWhenEmpty: string | undefined = undefined
  ) {
    const rec = this.items.at(index) as T
    if (rec) {
      let rv = rec[field]
      if (stringValueForObjects !== undefined && typeof rv === 'object') {
        rv = stringValueForObjects as NonNullable<T>[keyof T]
      }

      if (stringValueWhenEmpty !== undefined && !rv) {
        rv = stringValueWhenEmpty as NonNullable<T>[keyof T]
      }

      return rv
    }
  }

  stringValueByIndex(index: number, field: keyof T = this.keyField) {
    return this.valueByIndex(index, field, '') as string
  }

  indexByKey(key: string) {
    for (let i = 0; i < this.length; i++) {
      const rec = this.items[i]
      if (rec[this.keyField] === key) {
        return i
      }
    }
  }

  indexesByKeys(keys: string[]) {
    const rv: number[] = []
    for (let i = 0; i < this.length; i++) {
      const rec = this.items[i]
      if (keys.includes(rec[this.keyField] as string)) {
        rv.push(i)
      }
    }
    return rv
  }

  itemByKey(key: string) {
    let idx: number | undefined = this.indexByKey(key)
    if (idx !== undefined) {
      return this.items[idx]
    }
  }

  valueByKey(key: string, field: keyof T = this.keyField) {
    let idx: number | undefined = this.indexByKey(key)
    if (idx !== undefined) {
      return this.valueByIndex(idx, field)
    }
  }

  private reSort() {
    this.sortBy(this._sortFields as KnownKeys<T>[], this._sortDirections)
  }

  addItems(items: T[], unique: boolean = true) {
    if (!unique) {
      this._allItems.push(...items)
    } else {
      const uniqueItems: T[] = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!this.allKeys.includes(item[this.keyField] as string)) {
          uniqueItems.push(item)
        }
      }
      this._allItems.push(...uniqueItems)
    }
    this.reSort()
  }

  removeItemsAt(idxs: number[]) {
    for (let i = idxs.length - 1; i >= 0; i--) {
      this._allItems.splice(idxs[i], 1)
    }
  }

  removeItemsWithKeys(keys: string[]) {
    const idxs = this.indexesByKeys(keys)
    this.removeItemsAt(idxs)
    this.reSort()
  }

  sortBy(fields: KnownKeys<T>[], directions: SortDir[] = []) {
    if (fields.length !== directions.length) {
      if (fields.length > directions.length) {
        const diff = fields.length - directions.length
        for (let i = 0; i < diff; i++) {
          directions.push(1)
        }
      } else {
        directions = directions.slice(0, fields.length)
      }
    }

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

    this.filterBy(
      this._filterField as string,
      this._filterQuery,
      this._filterIds
    )
  }

  filterBy(
    field: KnownKeys<T> | string,
    query: T[keyof T] | undefined,
    ids: T[keyof T][] | undefined
  ) {
    this._filterField = field as keyof T
    this._filterQuery = query as T[typeof this._filterField]
    this._filterIds = ids as T[typeof this._filterField][]

    if (this._filterQuery === undefined && this._filterIds === undefined) {
      this._items = this._allItems
    } else if (this._filterIds !== undefined) {
      const rv: T[] = []
      this._allItems.forEach((itm) => {
        if (this._filterIds?.includes(itm[this._filterField])) rv.push(itm)
      })
      this._items = rv
    } else {
      const rv: T[] = []
      this._allItems.forEach((itm) => {
        if (itm[this._filterField] === this._filterQuery) rv.push(itm)
      })
      this._items = rv
    }
    this.updated()
  }
}
