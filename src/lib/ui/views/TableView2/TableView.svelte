<script lang="ts">
import { RecordList } from '$lib/utils/record-list'
export let recs: RecordList<any>
</script>

{#if recs.length === 0}
  Loading...
{:else if recs.fieldsToShow.length === 0}
  Field list is undefined.
{:else}
  <div class="table">
    <div class="row sticky-top">
      {#each recs.fieldsToShow as field}
        <div class="cell th">
          {field}
        </div>
      {/each}
    </div>
    {#each recs as _, i}
      <div class="row">
        {#each recs.fieldsToShow as field}
          <div class="cell">
            {recs.valueByIndex(i, field, '')}
          </div>
        {/each}
      </div>
    {/each}
    <div class="row sticky-bottom">
      {#each recs.fieldsToShow as field}
        <div class="cell tf">
          {field}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
.table {
  background-color: dimgrey;
  display: grid;
  row-gap: 1px;
  font-size: 1rem;
}

.row {
  background-color: dimgrey;
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 6rem 6rem 1fr 12rem;
  column-gap: 1px;
  font-family: 'JetBrains Mono';
}

.cell {
  text-wrap: nowrap;
  background-color: white;
  padding-inline-start: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.th {
  background-color: yellow;
  font-weight: bold;
}

.tf {
  background-color: chartreuse;
  font-weight: bold;
}

.sticky-top {
  position: sticky;
  top: 0px;
  border-bottom-style: solid;
  margin-bottom: -1px;
}

.sticky-bottom {
  position: sticky;
  bottom: 0px;
  border-top-style: solid;
  margin-top: -1px;
}
</style>
