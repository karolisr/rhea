import { getAllSeqRecs, getSequences } from '$lib/api/db/seqrecs'
import type { Databases } from '$lib/svelte-stores/databases'
import { RecordList } from '$lib/utils/record-list'
import type { IndexedUndefined } from '$lib/types'
import {
  Doc,
  SeqRecordDoc,
  SeqRecordDocGenBank,
  SeqRecordDocUser,
  AlignmentDoc
} from '.'
import { type SeqType, mkSeq } from '$lib/seq'
import { SeqRecord } from '$lib/seq/seq-record'
import { SeqList } from '$lib/seq/seq-list'

export class DocList {
  protected _dbs: Databases
  protected _uid: string
  protected _list: RecordList<Doc>
  protected _seqsCachedIds: Set<string> = new Set()

  constructor(
    dbs: Databases,
    uid: string,
    sortFields: (keyof Doc)[] = [],
    sortDirections: (1 | -1)[] = []
  ) {
    this._dbs = dbs
    this._uid = uid
    this._list = new RecordList<Doc>(uid, [], 'uid')
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
    this._list.sortBy(sortFields, sortDirections)
    this.init()
  }

  private async init() {
    const _dbRecs = await getAllSeqRecs(this._dbs, 'dbSeqRecs')
    const _items: Doc[] = []
    for (let i = 0; i < _dbRecs.length; i++) {
      const _dbrec = _dbRecs[i]
      let _organism = _dbrec.organism as string
      let _organelle = _dbrec.organelle as string
      // ToDo: clean this up --------------------------------------------------
      let _def = _dbrec.definition as string
      _def = _def.replace(_organism, '').trim()
      _def = _def.replace(`${_organelle},`, '').trim()
      // ----------------------------------------------------------------------
      const _doc: SeqRecordDocGenBank = new SeqRecordDocGenBank(
        _dbrec.accession_version as string,
        _dbrec.accession_version as string,
        _def,
        _dbrec.moltype as keyof typeof SeqType,
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

  // private updated() {
  //   dispatchEvent(new Event(this.updatedEventName))
  // }

  public async getSeqsForIds(ids: Set<string>) {
    const _seqRecs: SeqRecord[] = []
    // const _ids = [...ids]
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

  public addItems(items: Doc[]) {
    this._list.addItems(items)
  }

  public get updatedEventName(): string {
    return `${this._uid}-updated`
  }

  public get list(): RecordList<Doc> {
    return this._list
  }

  public get tableViewList(): RecordList<IndexedUndefined> {
    return this._list as unknown as RecordList<IndexedUndefined>
  }
}
