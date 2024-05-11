export interface Indexed {
  [index: string]: string | number | object | boolean | null
}

export interface IndexedUndefined {
  [index: string]: string | number | object | boolean | null | undefined
}

export type Prefixed<Type, Prefix extends string> = {
  [Property in keyof Type as `${Prefix}${string & Property}`]: () => Type[Property]
}

export type Unlistener = () => void

export interface Tree extends IndexedUndefined {
  id: string
  parent_id: Tree['id'] | null
  children: Tree[]
}

export interface Collection extends Tree {
  label: string
  notes: string
}

export interface CollectionRecordMap extends IndexedUndefined {
  collection_id: Collection['id']
  record_id: string
}
