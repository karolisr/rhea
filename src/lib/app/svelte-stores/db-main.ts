import { writable } from 'svelte/store'
import {
  db_main_init,
  db_main_delete,
  db_get,
  db_get_all,
  db_put
} from '$lib/app/db'
import type { DBMain } from '$lib/app/db/types'
import type { IDBPDatabase, StoreNames, StoreValue, StoreKey } from 'idb'
import type { ESummaryNuccore } from '$lib/ncbi'
import { type GBSeq } from '$lib/ncbi/types/GBSet'
import type { Taxon } from '$lib/ncbi/types/TaxaSet'

let db: IDBPDatabase<DBMain>

export interface DBMainSvelteStore {
  delete: typeof db_main_delete
  get: typeof db_main_get
  get_all: typeof db_main_get_all
  put: typeof db_main_put
  seq_nt_summ: ESummaryNuccore[]
  taxon: Taxon[]
  gbseq: GBSeq[]
  db: IDBPDatabase<DBMain>
}

async function prep_db_main() {
  db = await db_main_init()
  const _db_main_svelte_store: DBMainSvelteStore = {
    delete: async () => {
      db.close()
      await db_main_delete()
      db = await db_main_init()
      ;(await db_main).update((_) => {
        _.gbseq = []
        _.seq_nt_summ = []
        _.taxon = []
        _.db = db
        return _
      })
    },
    get: db_main_get,
    get_all: db_main_get_all,
    put: db_main_put,
    gbseq: (await db_main_get_all('gbseq')) ?? [],
    seq_nt_summ: (await db_main_get_all('seq_nt_summ')) ?? [],
    taxon: (await db_main_get_all('taxon')) ?? [],
    db
  }
  return writable(_db_main_svelte_store)
}

const db_main = prep_db_main()
export default db_main

const db_main_get = async <StoreName extends StoreNames<DBMain>>(
  id: StoreKey<DBMain, StoreName> | IDBKeyRange,
  store_name: StoreName
) => {
  return (await db_get(id, store_name, db)) as StoreValue<DBMain, StoreName>
}

const db_main_get_all = async <StoreName extends StoreNames<DBMain>>(
  store_name: StoreName
) => {
  return (await db_get_all(store_name, db)) as StoreValue<DBMain, StoreName>[]
}

const db_main_put = async <StoreName extends StoreNames<DBMain>>(
  items: StoreValue<DBMain, StoreName>[],
  store_name: StoreName
) => {
  await db_put(items, store_name, db)
  const gbseq = await db_main_get_all('gbseq')
  const seq_nt_summ = await db_main_get_all('seq_nt_summ')
  const taxon = await db_main_get_all('taxon')
  const store = await db_main
  store.update((_) => {
    _.gbseq = gbseq
    _.seq_nt_summ = seq_nt_summ
    _.taxon = taxon
    return _
  })
}
