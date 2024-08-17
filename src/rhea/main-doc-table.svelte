<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { TableView } from '$lib/ui/table-view'
import { DocListMain } from '$lib/models/doc/doc-list-main'

export let tvMainRowH: number | undefined = undefined
export let docListMain: DocListMain
export let activeRowKey: string | undefined
export let selectedRowKeys: string[]
export let selCollGrp: string | undefined
export let selColl: string | undefined
export let collUpdated: boolean

onMount(() => {})
onDestroy(() => {})

async function onDeleteRows(ids: string[]) {
  if (selColl !== undefined && selCollGrp === 'coll-user') {
    try {
      await docListMain.remFromColl(ids, selColl)
      collUpdated = true
    } catch (error) {
      console.error(error)
    }
  } else if (selColl !== undefined && selCollGrp === 'coll-db-all-recs') {
    try {
      await docListMain.delFromDb(ids)
      collUpdated = true
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<TableView
  uid="main-doc-list-table"
  rl="{docListMain.tableViewList}"
  bind:rowHeight="{tvMainRowH}"
  bind:activeRowKey
  bind:selectedRowKeys
  {onDeleteRows}
  showCheckBoxes
  multiRowSelect
  showHeaderRow
  draggable />
