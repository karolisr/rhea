import { readable, type Readable } from 'svelte/store'
import {
  DB,
  initDBTaxonomy,
  initDBSequences,
  initDBCollections
} from '$lib/app/api/db'

export interface Databases {
  dbTaxonomy: DB
  dbSequences: DB
  dbCollections: DB
}

async function init(): Promise<Readable<Databases>> {
  const dbCollections = await initDBCollections()
  const dbSequences = await initDBSequences()
  const dbTaxonomy = await initDBTaxonomy()
  let dbs: Databases = {
    dbTaxonomy,
    dbSequences,
    dbCollections
  }
  console.log('Databases Loaded.')
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
//     db = _.dbSequences
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
