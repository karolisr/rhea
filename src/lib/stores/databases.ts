import { readable, type Readable } from 'svelte/store'

import {
  DB,
  initDBTaxonomy,
  initDBSummaries,
  initDBSeqRecs,
  initDBSeqRecsUser,
  initDBSequences,
  initDBSequencesUser,
  initDBCollections
} from '$lib/backend/db'

import { gSysInfo } from '$lib/backend/system-info'

export interface Databases {
  dbsOK: boolean
  dbTaxonomy: DB | null
  dbSummaries: DB | null
  dbSeqRecs: DB | null
  dbSeqRecsUser: DB | null
  dbSequences: DB | null
  dbSequencesUser: DB | null
  dbCollections: DB | null
}

async function init(): Promise<Readable<Databases>> {
  let dbsOK = false
  let dbCollections = null
  let dbSummaries = null
  let dbSeqRecs = null
  let dbSeqRecsUser = null
  let dbSequences = null
  let dbSequencesUser = null
  let dbTaxonomy = null

  if (gSysInfo.browser === 'Tauri') {
    dbsOK = true
    dbCollections = await initDBCollections()
    dbSummaries = await initDBSummaries()
    dbSeqRecs = await initDBSeqRecs()
    dbSeqRecsUser = await initDBSeqRecsUser()
    dbSequences = await initDBSequences()
    dbSequencesUser = await initDBSequencesUser()
    dbTaxonomy = await initDBTaxonomy()
  }

  let dbs: Databases = {
    dbsOK,
    dbTaxonomy,
    dbSummaries,
    dbSeqRecs,
    dbSeqRecsUser,
    dbSequences,
    dbSequencesUser,
    dbCollections
  }

  if (gSysInfo.browser === 'Tauri') {
    console.info('Databases loaded.')
  } else {
    console.info('Databases were not loaded:', gSysInfo.browser)
  }
  return readable(dbs)
}

const databases = init()
export default databases
