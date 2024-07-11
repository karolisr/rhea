import { readable, type Readable } from 'svelte/store'
import { BROWSER } from '$lib/app/api'
import {
  DB,
  initDBTaxonomy,
  initDBSeqRecs,
  initDBSequences,
  initDBCollections
} from '$lib/app/api/db'

export interface Databases {
  dbsOK: boolean
  dbTaxonomy: DB | null
  dbSeqRecs: DB | null
  dbSequences: DB | null
  dbCollections: DB | null
}

async function init(): Promise<Readable<Databases>> {
  let dbsOK = false
  let dbCollections = null
  let dbSeqRecs = null
  let dbSequences = null
  let dbTaxonomy = null

  if (BROWSER === 'Tauri') {
    dbsOK = true
    dbCollections = await initDBCollections()
    dbSeqRecs = await initDBSeqRecs()
    dbSequences = await initDBSequences()
    dbTaxonomy = await initDBTaxonomy()
  }

  let dbs: Databases = {
    dbsOK,
    dbTaxonomy,
    dbSeqRecs,
    dbSequences,
    dbCollections
  }

  if (BROWSER === 'Tauri') {
    console.info('Databases loaded.')
  } else {
    console.info('Databases were not loaded:', BROWSER)
  }
  return readable(dbs)
}

const databases = init()
export default databases

// ----------------------------------------------------------------------------
// Usage Template:

// import databases from '$lib/app/svelte-stores/databases'
// import { DB } from '$lib/app/api/db'
// import type { IndexedUndefined } from '$lib/types'

// export async function xyz() {
//   let dbs: Awaited<typeof databases> = await databases
//   let db: DB | undefined = undefined
//   const unsubscribe = dbs.subscribe((_) => {
//     db = _.dbSeqRecs
//   })
//   let rv: IndexedUndefined[] = []
//   if (db !== undefined) {
//     db = db as DB
//     // Do Stuff.
//   }
//   unsubscribe()
//   return rv
// }
// ----------------------------------------------------------------------------
