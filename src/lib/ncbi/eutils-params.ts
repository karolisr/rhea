import { NCBIDatabase, IdType, RetTypeEFetch, RetTypeESearch, RetMode } from '.'

export class EutilParams {
  // NCBI ---------------------------------------------------------------------
  tool: string | undefined
  email: string | undefined
  api_key: string | undefined

  db: keyof typeof NCBIDatabase | undefined
  term: string | undefined
  idtype: keyof typeof IdType | undefined

  _ids: string[] | undefined

  usehistory: 'y' | undefined
  WebEnv: string | undefined
  query_key: string | undefined

  retstart: number | undefined
  retmax: number | undefined

  rettype: keyof typeof RetTypeESearch | keyof typeof RetTypeEFetch | undefined
  retmode: keyof typeof RetMode | undefined

  version: string | undefined

  // sort: string | undefined
  // field: string | undefined
  // datetype: string | undefined
  // reldate: string | undefined
  // mindate: string | undefined
  // maxdate: string | undefined
  // bdata: string | undefined
  // cmd: string | undefined
  // complexity: string | undefined
  // dbfrom: string | undefined
  // holding: string | undefined
  // linkname: string | undefined
  // location: string | undefined
  // seq_start: string | undefined
  // seq_stop: string | undefined
  // strand: string | undefined

  // Additional ---------------------------------------------------------------
  count: number | undefined
  last: boolean | undefined
  // --------------------------------------------------------------------------

  set ids(ids: string[]) {
    this._ids = ids
  }

  get ids(): string[] {
    if (this._ids !== undefined) {
      return this._ids
    } else {
      return []
    }
  }

  toObject(): Record<string, string> {
    const obj: Record<string, string> = {}
    Object.keys(this).forEach((_) => {
      const k = _ as keyof EutilParams
      let v = this[k]
      if (v !== undefined) {
        let p = k as string
        if (k === '_ids') {
          p = 'id'
          v = (v as string[]).join(',')
        }
        obj[p] = String(v as string | number | boolean)
      }
    })
    return obj
  }
}
