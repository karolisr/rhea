<script lang="ts">
import { TableView } from '$lib/ui/table-view'
import { RecordList } from '$lib/models'
import type { IndexedUndefined } from '$lib/types'

let lst: IndexedUndefined[] = []

for (let i = 1; i < 16; i++) {
  lst.push({ id: `${i}`, val: i })
}

let rl = new RecordList('rl-test', lst, 'id')
</script>

<TableView
  uid="tv-test"
  {rl}
  showHeaderRow
  showFooterRow
  showCheckBoxes
  multiRowSelect
  >
</TableView>
