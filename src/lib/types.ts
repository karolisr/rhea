export interface Indexed {
  [index: string]: string | number | object | boolean
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
