<script lang="ts">
import TableView from '$lib/ui/views/TableView'
import { DocList } from '$lib/doc/doc-list'

export let tvMainRowH: number | undefined = undefined
export let mainDocList: DocList
export let activeRowKey: string | undefined
export let selectedRowKeys: string[]
export let selCollGrp: string | undefined
export let selColl: string | undefined
export let collUpdated: boolean

async function onDeleteRows(ids: string[]) {
  if (selColl !== undefined && selCollGrp === 'coll-user') {
    try {
      await mainDocList.remFromColl(ids, selColl)
    } catch (error) {
      console.error(error)
    }
    collUpdated = true
  } else if (selColl !== undefined && selCollGrp === 'coll-db-all-recs') {
    try {
      await mainDocList.delFromDb(ids)
    } catch (error) {
      console.error(error)
    }
    collUpdated = true
  }
}
</script>

<TableView
  uid="seq-rec-list"
  rl="{mainDocList.tableViewList}"
  bind:rowHeight="{tvMainRowH}"
  bind:activeRowKey
  bind:selectedRowKeys
  {onDeleteRows}
  showCheckBoxes
  multiRowSelect
  showHeaderRow />
