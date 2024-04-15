<script lang="ts">
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'
import Tables from './testing/tables.svelte'

let _db_main: Readable<DBMainSvelteStore>

async function delete_db_main() {
  _db_main = await db_main
  await $_db_main.delete()
}
</script>

<div class="padded">
  <button class="danger" on:click="{delete_db_main}">Delete DB</button>
</div>

<Tables />
