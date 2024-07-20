import { RecordList } from '$lib/utils/record-list'
import { Doc, SeqRecordDocGenBank, SeqRecordDocUser, AlignmentDoc } from '.'
import type { IndexedUndefined } from '$lib/types'
import { getAllSeqRecs } from '$lib/api/db/gbseq'

export class DocList {
  protected _uid: string
  protected _list: RecordList<Doc>

  constructor(
    uid: string,
    sortFields: (keyof Doc)[] = [],
    sortDirections: (1 | -1)[] = []
  ) {
    this._uid = uid
    this._list = new RecordList<Doc>(uid, [], 'uid')
    this._list.fieldsToShow = ['id', 'moltype', 'definition']
    this._list.sortBy(sortFields, sortDirections)
    this.init()
  }

  private async init() {
    const _dbrecs = await getAllSeqRecs()
    const _items: Doc[] = []
    for (let i = 0; i < _dbrecs.length; i++) {
      const _dbrec = _dbrecs[i]
      const _doc: SeqRecordDocGenBank = new SeqRecordDocGenBank(
        _dbrec.accession_version as string,
        _dbrec.accession_version as string,
        _dbrec.definition as string,
        _dbrec.moltype as string
      )
      _items.push(_doc)
    }
    this.addItems(_items)
  }

  // private updated() {
  //   dispatchEvent(new Event(this.updatedEventName))
  // }

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
