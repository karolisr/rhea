<script lang="ts">
import TableView from '$lib/ui/views/TableView'
import type { IndexedUndefined } from '$lib/types'
import { type Doc } from '$lib/doc'
import { RecordList } from '$lib/utils/record-list'

export let tvMainRowH: number | undefined = undefined
export let mainDocList: Doc[] = []
let mainDocListRL: RecordList<Doc>
$: mainDocListRL = new RecordList<Doc>(mainDocList ?? [])
$: mainDocListRLHack = mainDocListRL as unknown as RecordList<IndexedUndefined>
</script>

<TableView
  uid="seq-rec-table"
  rl="{mainDocListRLHack}"
  bind:rowHeight="{tvMainRowH}"
  showCheckBoxes
  multiRowSelect
  showHeaderRow />
