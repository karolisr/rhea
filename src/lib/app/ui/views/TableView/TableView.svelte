<script lang="ts">
import { RecordList } from '$lib/utils/record-list'
export let recs: RecordList<any>

function sort(fs: typeof recs.fields, ds: (1 | -1)[]) {
  recs.sortBy(fs, ds)
  recs = recs
}

</script>

{#if recs.length === 0}
  Loading...
{:else if recs.fieldsToShow.length === 0}
  Field list is undefined.
{:else}
  <table>
    <thead>
      <tr>
        {#each recs.fieldsToShow as field}
          <th scope="col" on:dblclick="{sort([field], [1])}">{field}</th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#each recs as _, i}
        <tr>
          {#each recs.fieldsToShow as field}
            <td>{recs.valueByIndex(i, field)}</td>
          {/each}
        </tr>
      {/each}
    </tbody>

    <tfoot>
      <tr>
        {#each recs.fieldsToShow as field}
          <th>{field}</th>
        {/each}
      </tr>
    </tfoot>
  </table>
{/if}
