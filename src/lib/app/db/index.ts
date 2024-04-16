import { deleteDB, openDB } from 'idb'
import type { DBMain } from './types'
import type { IDBPDatabase, StoreNames, StoreValue, StoreKey } from 'idb'

const db_main_name = 'DBMain'

export async function db_main_delete() {
  await deleteDB(db_main_name, {
    blocked(currentVersion: number, event: IDBVersionChangeEvent) {
      console.log('db_main_delete blocked ::', event, currentVersion)
    }
  })
}

export async function db_main_init(version: number = 7) {
  const db_main = await openDB<DBMain>(db_main_name, version, {
    upgrade(database, oldVersion, newVersion, transaction, event) {
      console.log(
        'db_main_init upgrade ::',
        database,
        oldVersion,
        newVersion,
        transaction,
        event
      )
      if (newVersion !== oldVersion) {
        if (oldVersion === 0) {
          const os_seq_nt_summ = database.createObjectStore('seq_nt_summ', {
            keyPath: 'accessionversion'
          })
          os_seq_nt_summ.createIndex('TaxId', 'taxid')
          database.createObjectStore('taxon', { keyPath: 'TaxId' })
          database.createObjectStore('gbseq', {
            keyPath: 'GBSeq_accession_version'
          })
        }
        if (oldVersion < 2) {
          transaction.objectStore('seq_nt_summ').createIndex('genome', 'genome')
        }
        if (oldVersion < 3) {
          transaction
            .objectStore('seq_nt_summ')
            .createIndex('sourcedb', 'sourcedb')
        }
        if (oldVersion < 4) {
          transaction.objectStore('taxon').createIndex('Division', 'Division')
          transaction.objectStore('taxon').createIndex('GCId', 'GCId')
          transaction.objectStore('taxon').createIndex('MGCId', 'MGCId')
          transaction
            .objectStore('taxon')
            .createIndex('ParentTaxId', 'ParentTaxId')
          transaction.objectStore('taxon').createIndex('Rank', 'Rank')
        }
        if (oldVersion < 6) {
          const os_collection = database.createObjectStore('collection', {
            keyPath: 'id'
          })
          os_collection.add({
            id: 'ROOT',
            label: 'ROOT',
            parentId: 'NONE',
            notes: ''
          })
          const os_coll_gbseq_map = database.createObjectStore(
            'coll_gbseq_map',
            {
              keyPath: 'mapKey',
              autoIncrement: true
            }
          )
          os_coll_gbseq_map.createIndex('colId', 'colId')
        }
      }
    },
    blocked(currentVersion, blockedVersion, event) {
      console.log(
        'db_main_init blocked ::',
        event,
        currentVersion,
        blockedVersion
      )
    },
    blocking(currentVersion, blockedVersion, event) {
      console.log(
        'db_main_init blocking ::',
        event,
        currentVersion,
        blockedVersion
      )
    },
    terminated() {
      console.log('db_main_init terminated')
    }
  })
  return db_main
}

export async function db_put<T>(
  items: StoreValue<T, StoreNames<T>>[],
  store_name: StoreNames<T>,
  db: IDBPDatabase<T>
) {
  const tx = db.transaction(store_name, 'readwrite')
  await Promise.all([...items.map((i) => tx.store.put(i)), tx.done])
}

export async function db_get_all<T>(
  store_name: StoreNames<T>,
  db: IDBPDatabase<T>
) {
  return await db.getAll(store_name)
}

export async function db_get<T>(
  id: StoreKey<T, StoreNames<T>> | IDBKeyRange,
  store_name: StoreNames<T>,
  db: IDBPDatabase<T>
) {
  return await db.get<StoreNames<T>>(store_name, id)
}

export async function db_del<T>(
  id: StoreKey<T, StoreNames<T>> | IDBKeyRange,
  store_name: StoreNames<T>,
  db: IDBPDatabase<T>
) {
  return await db.delete<StoreNames<T>>(store_name, id)
}
