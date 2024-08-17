import { dateTimeStringSortable } from '$lib/utils'
import {
  addToCollection,
  removeFromCollection,
  createCollection
} from '$lib/backend/db/collections'
import {
  getAllSeqSummaries,
  deleteSeqSummaries
} from '$lib/backend/db/summaries'
import type { ESummaryNuccore } from '$lib/ncbi'
import type { SeqType } from '$lib/seq'
import type { Databases } from '$lib/stores/databases'
import { Doc, SeqRecordDocGenBank } from '.'
import { DocList } from './doc-list'

export class DocListSrch extends DocList {
  constructor(
    dbs: Databases,
    uid: string,
    sortFields: (keyof Doc)[] = [],
    sortDirections: (1 | -1)[] = []
  ) {
    super(dbs, uid, sortFields, sortDirections)
    this._list.fieldsToShow = [
      'id',
      'length',
      // 'length_bp',
      'moltype',
      'tax_id',
      'organism',
      'organelle',
      // 'plasmid',
      'definition'
    ]
  }

  public async init() {
    await super.init()
    const _dbSumms = await getAllSeqSummaries(this._dbs)
    const _items: Doc[] = []
    for (let i = 0; i < _dbSumms.length; i++) {
      const s = _dbSumms[i]
      let _uid = s.accessionversion as string
      if (this._list.allKeys.includes(_uid)) {
        continue
      }
      const _organism = s.organism as string
      const _organelle = s.genome as string
      const _moltype = (s.moltype as string).toUpperCase()
      // ToDo: clean this up ----------------------------------------------
      let _def = s.title as string
      _def = _def.replace(_organism, '').trim()
      _def = _def.replace(`${_organelle},`, '').trim()
      // ------------------------------------------------------------------
      const _doc: SeqRecordDocGenBank = new SeqRecordDocGenBank(
        _uid,
        _uid,
        _def,
        _moltype as keyof typeof SeqType,
        _organism,
        s.taxid as number,
        s.slen as number,
        -1,
        _organelle,
        ''
      )
      _items.push(_doc)
    }
    this.addItems(_items)
  }

  public async addToColl(ids: string[], collId: string) {
    await addToCollection(
      ids,
      collId,
      this._dbs,
      'dbSummaries',
      'assoc_esummseq_search_results'
    )
  }

  public async remFromColl(ids: string[], collId: string) {
    await removeFromCollection(
      ids,
      collId,
      this._dbs,
      'dbSummaries',
      'assoc_esummseq_search_results'
    )
  }

  public async delFromDb(ids: string[]) {
    try {
      await deleteSeqSummaries(ids, this._dbs)
      this._list.removeItemsWithKeys(ids)
    } catch (error) {
      console.error(error)
    }
  }

  public async processSearchResults(esummaryResult: ESummaryNuccore[]) {
    let collId: string | null = null
    if (esummaryResult.length > 0 && this._dbs.dbCollections) {
      collId = await createCollection(
        'ROOT',
        dateTimeStringSortable(),
        '',
        this._dbs.dbCollections,
        'search_results'
      )

      if (collId !== null) {
        const _uids: string[] = []
        for (let i = 0; i < esummaryResult.length; i++) {
          const s = esummaryResult[i]
          const _uid = s.accessionversion
          _uids.push(_uid)
        }
        this.addToColl(_uids, collId)
      }
    }
    return collId
  }
}
