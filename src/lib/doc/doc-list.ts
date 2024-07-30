import type { Databases } from '$lib/svelte-stores/databases'
import { RecordList } from '$lib/utils/record-list'
import type { IndexedUndefined } from '$lib/types'
import { Doc } from '.'

export class DocList {
  protected _dbs: Databases
  protected _uid: string
  protected _list: RecordList<Doc>

  constructor(
    dbs: Databases,
    uid: string,
    sortFields: (keyof Doc)[] = [],
    sortDirections: (1 | -1)[] = []
  ) {
    this._dbs = dbs
    this._uid = uid
    this._list = new RecordList<Doc>(uid, [], 'uid')
    this._list.sortBy(sortFields, sortDirections)
    this._list.fieldsToShow = [
      'id',
      // 'length',
      // 'length_bp',
      // 'moltype',
      // 'tax_id',
      // 'organism',
      // 'organelle',
      // 'plasmid',
      'definition'
    ]
    this.init()
  }

  protected async init() {}

  // private updated() {
  //   dispatchEvent(new Event(this.updatedEventName))
  // }

  public addItems(items: Doc[]) {
    this._list.addItems(items)
  }

  public async addToColl(ids: string[], collId: string) {
    // Extends
  }

  public async remFromColl(ids: string[], collId: string) {
    // Extends
  }

  public async delFromDb(ids: string[]) {
    // Extends
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
