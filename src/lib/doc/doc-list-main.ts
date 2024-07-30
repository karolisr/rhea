import { addToCollection, removeFromCollection } from '$lib/api/db/collections'
import { getAllSeqRecs, deleteSeqRecs, getSequences } from '$lib/api/db/seqrecs'
import { type SeqType, mkSeq } from '$lib/seq'
import { SeqList } from '$lib/seq/seq-list'
import { SeqRecord } from '$lib/seq/seq-record'
import type { Databases } from '$lib/svelte-stores/databases'
import { Doc, SeqRecordDocGenBank, SeqRecordDoc } from '.'
import { DocList } from './doc-list'

export class DocListMain extends DocList {
  protected _seqsCachedIds: Set<string> = new Set()

  constructor(
    dbs: Databases,
    uid: string,
    sortFields: (keyof Doc)[] = [],
    sortDirections: (1 | -1)[] = []
  ) {
    super(dbs, uid, sortFields, sortDirections)
    this._list.fieldsToShow = [
      'id',
      // 'length',
      'length_bp',
      'moltype',
      // 'tax_id',
      'organism',
      'organelle',
      // 'plasmid',
      'definition'
    ]
  }

  public async init() {
    await super.init()
    const _dbRecs = await getAllSeqRecs(this._dbs, 'dbSeqRecs')
    const _items: Doc[] = []
    for (let i = 0; i < _dbRecs.length; i++) {
      const _dbrec = _dbRecs[i]
      let _uid = _dbrec.accession_version as string
      if (this._list.allKeys.includes(_uid)) {
        continue
      }
      let _organism = _dbrec.organism as string
      let _organelle = _dbrec.organelle as string
      // ToDo: clean this up --------------------------------------------------
      let _def = _dbrec.definition as string
      _def = _def.replace(_organism, '').trim()
      _def = _def.replace(`${_organelle},`, '').trim()
      // ----------------------------------------------------------------------
      let _moltype = _dbrec.moltype as string
      if (_moltype.endsWith('RNA')) {
        _moltype = 'RNA'
      }
      // ----------------------------------------------------------------------
      const _doc: SeqRecordDocGenBank = new SeqRecordDocGenBank(
        _uid,
        _uid,
        _def,
        _moltype as keyof typeof SeqType,
        _organism,
        _dbrec.tax_id as number,
        _dbrec.length as number,
        _dbrec.length_bp as number,
        _organelle,
        _dbrec.plasmid as string
      )
      _items.push(_doc)
    }
    this.addItems(_items)
  }

  public async addToColl(ids: string[], collId: string) {
    await addToCollection(ids, collId, this._dbs, 'dbSeqRecs')
  }

  public async remFromColl(ids: string[], collId: string) {
    await removeFromCollection(ids, collId, this._dbs, 'dbSeqRecs')
  }

  public async delFromDb(ids: string[]) {
    try {
      await deleteSeqRecs(ids, this._dbs, 'dbSeqRecs')
      this._list.removeItemsWithKeys(ids)
    } catch (error) {
      console.error(error)
    }
  }

  public async getSeqsForIds(ids: Set<string>) {
    const _seqRecs: SeqRecord[] = []
    const _uncachedIds = [...ids.difference(this._seqsCachedIds)]
    const _dbSeqs = await getSequences(_uncachedIds, this._dbs, 'dbSequences')

    for (let i = 0; i < _dbSeqs.length; i++) {
      const _ = _dbSeqs[i]
      const uid = _['accession_version'] as string
      const str = _['sequence'] as string
      const doc = this._list.itemByKey(uid)
      if (doc !== undefined && doc instanceof SeqRecordDoc) {
        // ToDo: make sure to change the genetic code "1" to a variable!
        const seq = mkSeq(str, doc.moltype, 1)
        const seqRecord = new SeqRecord(uid, seq)
        doc.data = seqRecord
      }
      this._seqsCachedIds.add(uid)
    }

    for (let i = 0; i < this._list.length; i++) {
      const doc = this._list.items[i]
      if (ids.has(doc.uid)) {
        if (doc instanceof SeqRecordDoc && doc.data !== null) {
          _seqRecs.push(doc.data)
        }
      }
    }
    return new SeqList(_seqRecs)
  }
}
