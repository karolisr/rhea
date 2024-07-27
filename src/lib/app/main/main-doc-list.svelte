<script lang="ts">
import TableView from '$lib/ui/views/TableView'
import { DocList } from '$lib/doc/doc-list'
export let tvMainRowH: number | undefined = undefined
export let mainDocList: DocList
</script>

<TableView
  uid="seq-rec-list"
  rl="{mainDocList.tableViewList}"
  bind:rowHeight="{tvMainRowH}"
  showCheckBoxes
  multiRowSelect
  showHeaderRow />
