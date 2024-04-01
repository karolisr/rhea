import { getPropNames } from "$lib"

declare type KeyToKeyNoIndex<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
}
declare type ValuesOf<T> = T extends { [K in keyof T]: infer U } ? U : never
declare type KnownKeys<T> = ValuesOf<KeyToKeyNoIndex<T>>

export class ObjArray<T> {
  private _objArray: T[]

  constructor(objArray: T[]) {
    this._objArray = objArray
  }

  sort(field: KnownKeys<T>, rev: boolean = false): void {
    this._objArray.sort((a, b) => _sort(a, b, field, rev))
  }

  get length(): number {
    return this._objArray.length
  }

  row(index: number): T {
    return this._objArray.at(Math.min(this.length, index)) as T
  }

  value(index: number, field: KnownKeys<T>) {
    return this.row(index)[field as keyof T]
  }

  get fields(): (keyof T)[] {
    return getPropNames(this._objArray[0]) as (keyof T)[]
  }

  // get array(): T[] {
  //   return this._objArray
  // }

  // get type() {
  //   return typeof this._objArray[0]
  // }
}

function _sort<T>(
  a: T,
  b: T,
  field: KnownKeys<T>,
  rev: boolean = true
): number {
  const x = a[field as keyof T]
  const y = b[field as keyof T]

  let i = 1
  if (rev) {
    i = -1
  }

  if (typeof x === 'string' && typeof y === 'string') {
    if (x === y) return 0
    return x < y ? -i : i
  } else if (typeof x === 'number' && typeof y === 'number') {
    if (x === y) return 0
    return x < y ? -i : i
  } else if (typeof x === 'boolean' && typeof y === 'boolean') {
    if (x === y) return 0
    return x < y ? -i : i
  }

  return 1
}

// const obj: GBSeq = {
//   GBSeq_accession_version: 'ACC',
//   GBSeq_length: 0,
//   GBSeq_moltype: 'DNA'
// }

// const obj_list: ObjArray<GBSeq> = new ObjArray([obj])
// obj_list.sort('GBSeq_accession_version')
