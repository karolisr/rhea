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
  // closeAll: () => Promise<void>
}

async function init(): Promise<Readable<Databases>> {
  const dbCollections = await initDBCollections()
  const dbSequences = await initDBSequences()
  const dbTaxonomy = await initDBTaxonomy()
  let dbs: Databases = {
    dbTaxonomy,
    dbSequences,
    dbCollections
    // closeAll: async () => {
    //   console.log('closeAll begin')
    //   await dbCollections.close()
    //   await dbSequences.close()
    //   await dbTaxonomy.close()
    //   console.log('closeAll end')
    // }
  }
  console.log('Databases Loaded.')
  return readable(dbs)
}

const databases = init()
export default databases
