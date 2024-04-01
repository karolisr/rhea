<script lang="ts">
import subheader from '$lib/app/svelte-stores/subheader'
import type { IndexedUndefined } from '$lib/types'

import { ObjArray } from './ObjTmp'
import { range } from 'd3'

export let objArray: ObjArray<IndexedUndefined>
$: idxs = range(0, objArray.length)

export let pageSize: number = 10
export let sortBy: string | undefined = undefined
export let fields: string[] | undefined = undefined

$: _ok = dataPrep(objArray)

function dataPrep(objArray: ObjArray<IndexedUndefined>) {
  if (fields === undefined && objArray.length > 0) {

    const _fields = objArray.fields
    fields = []

    for (const f of _fields) {
      if (f !== 'GBSeq_sequence') {
        if (
          typeof objArray.value(0, f) === 'string' ||
          typeof objArray.value(0, f) === 'number' ||
          typeof objArray.value(0, f) === 'boolean'
        )
          fields.push(f)
      }
    }
  }
  if (fields && fields.length > 0) {
    if (sortBy !== undefined) {
      objArray.sort(sortBy)
    }
    return true
  }
  return false
}

$subheader = undefined
</script>

{#if dataPrep(objArray) === false}
  <span>Loading...</span>
{:else if fields === undefined}
  <span>Field list is undefined.</span>
{:else}
  {#each fields as field}{field}&nbsp;{/each}
  {#each idxs as i}
    {#each fields as field}
      {objArray.value(i, field)}&nbsp;
    {/each}
    <br /><br />
  {/each}
{/if}

<!--
{#if _data === undefined}
  <span>Loading...</span>
{:else if fields === undefined}
  <span>Field list is undefined.</span>
{:else}
  <table>
    <thead>
      <tr>
        {#each fields as field}
          <th>{field}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each _data as row, i}
        <tr>
          {#each fields as field}
            <td>
              {row[field]?.toString()}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        {#each fields as field}
          <th>{field}</th>
        {/each}
      </tr>
    </tfoot>
  </table>
{/if}
-->
