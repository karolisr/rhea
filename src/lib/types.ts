export interface Indexed {
  [index: string]: string | number | object | boolean | null
}

export interface IndexedUndefined {
  [index: string]: string | number | object | boolean | undefined
}

export interface Tree {
  children: Tree[]
  label: string
  id: string
  parentId: string
  notes: string
}

export type Prefixed<Type, Prefix extends string> = {
  [Property in keyof Type as `${Prefix}${string & Property}`]: () => Type[Property]
}

export type Unlistener = () => void
