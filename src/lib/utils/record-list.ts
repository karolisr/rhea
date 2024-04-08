import { getPropNames } from '$lib'
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import { type DBMain } from '$lib/app/db/types'

declare type KeyToKeyNoIndex<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
}
declare type ValuesOf<T> = T extends { [K in keyof T]: infer U } ? U : never
declare type KnownKeys<T> = ValuesOf<KeyToKeyNoIndex<T>>

export class RecordList<T> extends Array<T> {
  private _sortFields: KnownKeys<T>[]
  private _fieldsToShow: KnownKeys<T>[]
  private _sortDirections: (1 | -1)[]
  private _db_main: DBMainSvelteStore
  private _db_main_unsubscriber: () => void
  private _dbStoreName: 'gbseq' | 'taxon' | 'seq_nt_summ'
  private _keyField: DBMain[typeof this._dbStoreName]['key']

  constructor(
    sveteDBStore: Readable<DBMainSvelteStore>,
    dbStoreName: 'gbseq' | 'taxon' | 'seq_nt_summ',
    fieldsToShow: KnownKeys<T>[] | undefined = undefined
  ) {
    let _db_main: DBMainSvelteStore | undefined
    const _db_main_unsubscriber = sveteDBStore.subscribe((_) => {
      _db_main = _
    })

    if (_db_main) {
      super(...(_db_main[dbStoreName] as T[]))
    } else {
      throw new Error('Error creating a RecordList object.')
    }

    this._db_main_unsubscriber = _db_main_unsubscriber
    this._db_main = _db_main
    this._dbStoreName = dbStoreName

    this._keyField = this._db_main.db.transaction(dbStoreName).store
      .keyPath as string

    this._sortFields = []
    this._sortDirections = []

    if (fieldsToShow) {
      this._fieldsToShow = fieldsToShow
    } else {
      this._fieldsToShow = this.fields
    }
  }

  unsubscribe() {
    this._db_main_unsubscriber()
  }

  get keyField() {
    return this._keyField
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

  stringValueByIndex(index: number, field: keyof T) {
    return this.valueByIndex(index, field, '') as string
  }

  valueByIndex(
    index: number,
    field: keyof T,
    stringValueForObjects: string | undefined = undefined
  ) {
    const rec = this[index] as T
    const rv = rec[field]
    if (stringValueForObjects !== undefined && typeof rv === 'object') {
      return stringValueForObjects as string
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
