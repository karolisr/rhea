<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { filterSeqRecs } from '$lib/api/db/seqrecs'
import { type IndexedUndefined } from '$lib/types'
import TextInput from '$lib/ui/components/TextInput.svelte'
import { getFontSize } from '$lib/api'
import databases from '$lib/svelte-stores/databases'

export let idsByFilterTerm: Set<string> | undefined

let dbs: Awaited<typeof databases>
let filterTermRaw: string = ''
let filterTerm: string = ''
let filteredResults: IndexedUndefined[] | undefined

onMount(async () => {
  dbs = await databases
  addEventListener('seq-db-updated', dbUpdatedListener)
})

onDestroy(async () => {
  removeEventListener('seq-db-updated', dbUpdatedListener)
})

const dbUpdatedListener = async () => {
  _filterSeqRecs(filterTerm)
}

async function _filterSeqRecs(term: string) {
  if (term) {
    const rv = await filterSeqRecs(term, $dbs, 'dbSeqRecs')
    filteredResults = rv
  } else {
    filteredResults = undefined
    idsByFilterTerm = undefined
  }
}

$: filterTerm = processTerm(filterTermRaw)
$: _filterSeqRecs(filterTerm)
$: if (filteredResults !== undefined) {
  idsByFilterTerm = new Set(
    filteredResults.map((x) => x.accession_version as string)
  )
}

function processTerm(x: string) {
  if (x) {
    x = x.replaceAll(/\s+/g, ' ')
    x = x.replaceAll(/\++/g, '+')
    x = x.replaceAll(' and ', ' AND ')
    x = x.replaceAll(' or ', ' OR ')
    x = x.replaceAll(' not ', ' NOT ')
    x = x.replaceAll('*', '')
    x = x.replaceAll(/[^a-zA-Z\d\s+]/g, '')
    x = x.trim()
    x = x.replace(/^\+/g, '')
    x = x.replace(/\+$/g, '')
    x = x.replace(/^(AND|OR|NOT)/g, '')
    x = x.replace(/(AND|OR|NOT)$/g, '')
    x = x.trim()
  }
  if (x) {
    return `${x}*`
  } else {
    return ''
  }
}
</script>

<div class="form-grid">
  <div class="form-grid-item form-grid-item-1">
    <div>
      <TextInput
        id="searchTermInput"
        required="{true}"
        placeholder="{'Filter'}"
        bind:value="{filterTermRaw}" />
    </div>
  </div>
  <div class="form-grid-item form-grid-item-2">
    <div></div>
  </div>

  <div class="form-grid-item form-grid-item-3">
    <div></div>
  </div>
  <div class="form-grid-item form-grid-item-4">
    <div></div>
  </div>
</div>

<style>
.form-grid {
  /* background-color: coral; */
  flex-grow: 1;
  margin-block-start: calc(var(--pad) * 2);
  /* margin-block-end: calc(var(--pad) * 2 + 1px); */
  margin-inline: calc(var(--pad) * 2);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: calc((var(--fs) * 2) - 1px);
  gap: calc(var(--pad) * 2);
}

.form-grid-item {
  /* background-color: blanchedalmond; */
  display: flex;
  /* border-style: solid; */
  /* border-radius: 5px; */
}

.form-grid-item-1 {
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 2;
  /* border-style: none; */
}

.form-grid-item-1 > div {
  flex-grow: 1;
  display: flex;
  gap: calc(var(--pad) * 2);
  /* margin-inline: 10%; */
}

.form-grid-item-2 {
  grid-column-start: 1;
  grid-column-end: 2;
  grid-row-start: 2;
  grid-row-end: 6;
}

.form-grid-item-2 > div {
  margin-inline: auto;
  margin-block-start: calc(var(--pad) * 2);
}

.form-grid-item-3 {
  grid-column-start: 2;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 6;
}

.form-grid-item-3 > div {
  margin-inline: auto;
  margin-block-start: calc(var(--pad) * 2);
}

.form-grid-item-4 {
  grid-column-start: 3;
  grid-column-end: 4;
  grid-row-start: 2;
  grid-row-end: 6;
}

.form-grid-item-4 > div {
  margin-inline: auto;
  margin-block-start: calc(var(--pad) * 1);
}
</style>
