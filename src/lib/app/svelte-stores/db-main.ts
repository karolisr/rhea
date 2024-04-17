import { writable } from 'svelte/store'
import {
  db_main_init,
  db_main_delete,
  db_get,
  db_get_all,
  db_put,
  db_del,
  db_get_all_from_index
} from '$lib/app/db'
import type { DBMain, Collection } from '$lib/app/db/types'
import type {
  IDBPDatabase,
  StoreNames,
  StoreValue,
  StoreKey,
  IndexNames,
  IndexKey
} from 'idb'
import type { ESummaryNuccore } from '$lib/ncbi'
import type { GBSeq } from '$lib/ncbi/types/GBSet'
import type { Taxon } from '$lib/ncbi/types/TaxaSet'
import { v4 as uuid } from 'uuid'

let db: IDBPDatabase<DBMain>

export interface DBMainSvelteStore {
  delete: typeof db_main_delete
  get: typeof db_main_get
  get_all: typeof db_main_get_all
  put: typeof db_main_put
  del: typeof db_main_del
  createCollection: typeof createCollection
  deleteCollection: typeof deleteCollection
  get_all_from_index: typeof db_main_get_all_from_index
  seq_nt_summ: ESummaryNuccore[]
  taxon: Taxon[]
  gbseq: GBSeq[]
  collection: Collection[]
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
        _.collection = []
        _.db = db
        return _
      })
    },
    get: db_main_get,
    get_all: db_main_get_all,
    put: db_main_put,
    del: db_main_del,
    createCollection: createCollection,
    deleteCollection: deleteCollection,
    get_all_from_index: db_main_get_all_from_index,
    gbseq: (await db_main_get_all('gbseq')) ?? [],
    seq_nt_summ: (await db_main_get_all('seq_nt_summ')) ?? [],
    taxon: (await db_main_get_all('taxon')) ?? [],
    collection: (await db_main_get_all('collection')) ?? [],
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

const db_main_get_all_from_index = async <
  StoreName extends StoreNames<DBMain>,
  IndexName extends IndexNames<DBMain, StoreName>
>(
  store_name: StoreName,
  index_name: IndexName,
  id?: IndexKey<DBMain, StoreName, IndexName> | IDBKeyRange | null,
  count?: number
) => {
  return await db_get_all_from_index(store_name, index_name, db, id, count)
}

const db_main_put = async <StoreName extends StoreNames<DBMain>>(
  items: StoreValue<DBMain, StoreName>[],
  store_name: StoreName
) => {
  await db_put(items, store_name, db)
  await updateStore()
}

const db_main_del = async <StoreName extends StoreNames<DBMain>>(
  id: StoreKey<DBMain, StoreName> | IDBKeyRange,
  store_name: StoreName
) => {
  await db_del(id, store_name, db)
  await updateStore()
}

const createCollection = async (
  parentId: string,
  label: string,
  notes: string = ''
) => {
  const _ = { id: uuid(), parentId, label, notes }
  await db_main_put([_], 'collection')
}

const deleteCollection = async (id: unknown) => {
  if (id !== 'ROOT') {
    await db_main_del(id as string, 'collection')
  }
}

async function updateStore() {
  const gbseq = await db_main_get_all('gbseq')
  const seq_nt_summ = await db_main_get_all('seq_nt_summ')
  const taxon = await db_main_get_all('taxon')
  const collection = await db_main_get_all('collection')
  const store = await db_main
  store.update((_) => {
    _.gbseq = gbseq
    _.seq_nt_summ = seq_nt_summ
    _.taxon = taxon
    _.collection = collection
    return _
  })
}
