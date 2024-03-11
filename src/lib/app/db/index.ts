import { deleteDB, openDB } from 'idb'
import type { CDSDB } from './types'

export async function db_init() {
  // await deleteDB('cdsdb')
  const db = await openDB<CDSDB>('cdsdb', 1, {
    upgrade(_db) {
      _db.createObjectStore('nt', { keyPath: 'accessionversion' })
      _db.createObjectStore('xml', { keyPath: 'accessionversion' })
    }
    // blocked() {},
    // blocking() {},
    // terminated() {}
  })
  return db
}
