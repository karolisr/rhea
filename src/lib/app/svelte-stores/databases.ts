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
  closeAll: () => Promise<void>
}

async function init(): Promise<Readable<Databases>> {
  const dbTaxonomy = await initDBTaxonomy()
  const dbSequences = await initDBSequences()
  const dbCollections = await initDBCollections()
  let dbs: Databases = {
    dbTaxonomy,
    dbSequences,
    dbCollections,
    closeAll: async () => {
      console.log('closeAll begin')
      await dbCollections.close('collections')
      await dbSequences.close('sequences')
      await dbTaxonomy.close('taxonomy')
      console.log('closeAll end')
    }
  }
  return readable(dbs)
}

const databases = init()
export default databases
