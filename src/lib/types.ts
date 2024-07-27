export interface Indexed {
  [index: string]: string | number | object | boolean | null
}

export interface IndexedUndefined {
  [index: string]: string | number | object | boolean | null | undefined
}

export type Prefixed<Type, Prefix extends string> = {
  [Property in keyof Type as `${Prefix}${string & Property}`]: () => Type[Property]
}

export type KeyToKeyNoIndex<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
}

export type ValuesOf<T> = T extends {
  [K in keyof T]: infer U
}
  ? U
  : never

export type KnownKeys<T> = ValuesOf<KeyToKeyNoIndex<T>>

export type Unlistener = () => void

export type SortDir = 1 | -1

export interface Tree extends IndexedUndefined {
  id: string
  parent_id: Tree['id'] | null
  children: Tree[]
  child_count: number
  lineage: Tree['id'][]
  label: string
  notes: string
}

export interface Collection extends Tree {}

export interface CollectionRecordMap extends IndexedUndefined {
  collection_id: Collection['id']
  record_id: string
}
