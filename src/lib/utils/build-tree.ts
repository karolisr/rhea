import { type DBMainSvelteStore } from '$lib/app/svelte-stores/db/db-main'
import type { Tree } from '$lib/types'

export async function buildTree(
  db: DBMainSvelteStore,
  store_name: 'collection' = 'collection',
  parentId: string = 'ROOT',
  rootId: string = 'ROOT',
  rootLabel: string = 'Collections'
) {
  const p = await db.get(parentId, store_name)
  const nodes = await db.get_all_from_index(store_name, 'parentId', parentId)
  if (p.label === rootId) p.label = rootLabel
  let rv: Tree = {
    children: [],
    label: p.label,
    id: p.id,
    parentId: '',
    notes: p.notes
  }
  const rvp = rv['children'] as object[]
  if (nodes.length > 0) {
    nodes.sort((a, b) => {
      return a.label < b.label ? -1 : 1
    })
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const c = await buildTree(db, store_name, n.id, rootId, rootLabel)
      c.parentId = parentId
      rvp.push(c)
    }
  }
  return rv
}
