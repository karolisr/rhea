<script lang="ts">
import { onMount } from 'svelte'
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'

let _db_main: Readable<DBMainSvelteStore>
$: collections = $_db_main?.collection

onMount(async () => {
  _db_main = await db_main
  collections = $_db_main?.collection
})
</script>

<div class="OUTER">
  <div class="INNER-L"></div>
  <div class="INNER-R"></div>
</div>

<style lang="scss">
.OUTER {
  background-color: aliceblue;
  flex-grow: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
}

.INNER-L {
  background-color: beige;
  border-right-style: solid;
}

.INNER-R {
  background-color: bisque;
}
</style>
