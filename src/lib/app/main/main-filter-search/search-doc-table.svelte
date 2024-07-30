<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import TableView from '$lib/ui/views/TableView'
import { DocListSrch } from '$lib/doc/doc-list-srch'
import { type ESummaryNuccore } from '$lib/ncbi'
import searchStore from '$lib/svelte-stores/search-store'
import { getSeqSummariesForCollections } from '$lib/api/db/summaries'
import databases from '$lib/svelte-stores/databases'

export let tvMainRowH: number | undefined = undefined
export let docListSrch: DocListSrch
export let activeRowKeySrch: string | undefined
export let selectedRowKeysSrch: string[]
export let selCollGrp: string | undefined
export let selColl: string | undefined
export let selCollsSrch: string[] | undefined
export let collUpdatedSrch: boolean
export let selDocIdsSrch: Set<string>

let dbs: Awaited<typeof databases>

onMount(async () => {
  dbs = await databases
  addEventListener(docListSrch.updatedEventName, sdlUpdatedEventListener)
})

onDestroy(() => {
  removeEventListener(docListSrch.updatedEventName, sdlUpdatedEventListener)
  selDocIdsSrch = new Set()
})

const sdlUpdatedEventListener = () => {}

async function newSearchResults(_: boolean) {
  let results: ESummaryNuccore[] = []
  if ($searchStore.fresh) {
    results = [...$searchStore.results]
    $searchStore.fresh = false
  }
  const collId = await docListSrch.processSearchResults(results)
  $searchStore.results = []
  if (collId !== null) {
    selColl = collId
    collUpdatedSrch = true
    await docListSrch.init()
    _getIdsByColl([selColl])
  }
}

$: if ($searchStore.fresh) newSearchResults($searchStore.fresh)

$: {
  let _selDocIdsSrch = []
  if (activeRowKeySrch !== undefined) {
    if (selectedRowKeysSrch.length === 0) {
      _selDocIdsSrch = [activeRowKeySrch]
    } else {
      _selDocIdsSrch = [...selectedRowKeysSrch]
    }
  } else {
    _selDocIdsSrch = [...selectedRowKeysSrch]
  }

  const curr = new Set(_selDocIdsSrch)
  if (selDocIdsSrch.symmetricDifference(curr).size !== 0) {
    selDocIdsSrch = curr
  }
}

let idsByCollSrch: Set<string> = new Set()
async function _getIdsByColl(selCollsSrch: string[] | undefined) {
  const prev = idsByCollSrch
  let curr: Set<string>
  if (selCollGrp === 'coll-search-results' && selCollsSrch !== undefined) {
    curr = await getSeqSummariesForCollections(selCollsSrch, $dbs)
  } else {
    curr = new Set()
  }

  if (prev.symmetricDifference(curr).size !== 0) {
    idsByCollSrch = curr
  }
}

$: if (selCollsSrch !== undefined && $dbs && $dbs.dbsOK) {
  _getIdsByColl(selCollsSrch)
}

$: {
  if (docListSrch) {
    docListSrch.list.filterBy('id', undefined, [...idsByCollSrch])
  }
}

async function onDeleteRows(ids: string[]) {
  if (selCollGrp === 'coll-search-results' && selColl === 'ROOT') {
    try {
      await docListSrch.delFromDb(ids)
      // collUpdatedSrch = true
      _getIdsByColl(selCollsSrch)
    } catch (error) {
      console.error(error)
    }
  } else if (selCollGrp === 'coll-search-results' && selColl !== undefined) {
    try {
      await docListSrch.remFromColl(ids, selColl)
      // collUpdatedSrch = true
      _getIdsByColl(selCollsSrch)
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

{#if $dbs && $dbs.dbsOK}
  <TableView
    uid="search-doc-list-table"
    rl="{docListSrch.tableViewList}"
    bind:rowHeight="{tvMainRowH}"
    bind:activeRowKey="{activeRowKeySrch}"
    bind:selectedRowKeys="{selectedRowKeysSrch}"
    {onDeleteRows}
    showCheckBoxes
    multiRowSelect
    showHeaderRow />
{/if}
