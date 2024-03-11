import { deleteDB, openDB } from 'idb'
import type { DBMain, DBRaw } from './types'

const db_main_name = 'DBMain'
const db_raw_name = 'DBRaw'

export async function db_delete() {
  await deleteDB(db_main_name)
}

export async function db_init() {
  const db = await openDB<DBMain>(db_main_name, 1, {
    upgrade(_db) {
      _db.createObjectStore('seq_nt_summ', { keyPath: 'accessionversion' })
      _db.createObjectStore('tax_summ', { keyPath: 'taxid' })
      _db.createObjectStore('gbseq', { keyPath: 'GBSeq_accession_version' })
    }
    // blocked() {},
    // blocking() {},
    // terminated() {}
  })
  return db
}
