<script lang="ts">
import { onMount } from 'svelte'
import { type Readable } from 'svelte/store'
import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import db_main from '$lib/app/svelte-stores/db-main'
import ObjectTreeView from '$lib/ui/views/ObjectTreeView'

let _db_main: Readable<DBMainSvelteStore>

let get_all_from_index: typeof $_db_main.get_all_from_index
let get: typeof $_db_main.get

let obj: {}

async function buildTree(
  parentId: string = 'ROOT',
  rv: { [key: string]: {} } = {}
) {
  const p = await get(parentId, 'collection')
  const nodes = await get_all_from_index('collection', 'parentId', parentId)
  if (p.label === 'ROOT') p.label = 'Collections'
  rv[p.label] = []
  rv['id'] = p.id
  rv['notes'] = p.notes
  const rvp = rv[p.label] as {}[]
  if (nodes.length > 0) {
    nodes.sort((a, b) => {
      return a.label < b.label ? -1 : 1
    })
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      rvp.push(await buildTree(n.id))
    }
  }
  return rv
}

onMount(async () => {
  _db_main = await db_main
  get_all_from_index = $_db_main.get_all_from_index
  get = $_db_main.get
  obj = await buildTree()
})
</script>

{#if obj}
  <ObjectTreeView hideName expanded="{true}" {obj} />
{/if}
