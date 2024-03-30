<script lang="ts">
import subheader from '$lib/app/svelte-stores/subheader'
import type { IndexedUndefined } from '$lib/types'
import { getPropNames } from '$lib'

export let data: IndexedUndefined[]
export let pageSize: number = 10
export let sortBy: string | undefined = undefined

export let fields: string[] | undefined = undefined

$: _data = dataPrep(data)

function sortF(
  a: IndexedUndefined,
  b: IndexedUndefined,
  field: string,
  rev: boolean = true
): number {
  const x = a[field]
  const y = b[field]

  let i = 1
  if (rev) {
    i = -1
  }

  if (typeof x === 'string' && typeof y === 'string') {
    if (x === y) return 0
    return x < y ? -i : i
  } else if (typeof x === 'number' && typeof y === 'number') {
    if (x === y) return 0
    return x < y ? -i : i
  } else if (typeof x === 'boolean' && typeof y === 'boolean') {
    if (x === y) return 0
    return x < y ? -i : i
  }

  return 1
}

function dataPrep(data: IndexedUndefined[]) {
  if (fields === undefined && data && data.length > 0) {
    const _fields = getPropNames(data[0])
    fields = []

    for (const f of _fields) {
      if (f !== 'GBSeq_sequence') {
        if (
          typeof data[0][f] === 'string' ||
          typeof data[0][f] === 'number' ||
          typeof data[0][f] === 'boolean'
        )
          fields.push(f)
      }
    }
  }
  if (fields && fields.length > 0) {
    if (sortBy !== undefined) {
      const _ = sortBy
      return data.sort((a, b) => sortF(a, b, _)).slice(0, pageSize)
    } else {
      return data.slice(0, pageSize)
    }
  }
  return undefined
}

$subheader = undefined
</script>

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
