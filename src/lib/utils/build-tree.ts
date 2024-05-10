import type { Tree } from '$lib/types'
import { getCollections } from '$lib/app/api/db/collections'

export async function buildTree(
  parentId: string = 'ROOT',
  rootId: string = 'ROOT',
  rootLabel: string = 'Collections'
) {
  const p = (await getCollections(parentId))[0]
  const nodes = await getCollections(parentId, true)
  if (p.label === rootId) p.label = rootLabel
  let rv: Tree = {
    children: [],
    label: p.label,
    id: p.id,
    parent_id: '',
    notes: p.notes
  }
  const rvp = rv['children'] as object[]
  if (nodes.length > 0) {
    nodes.sort((a, b) => {
      return a.label < b.label ? -1 : 1
    })
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const c = await buildTree(n.id, rootId, rootLabel)
      c.parent_id = parentId
      rvp.push(c)
    }
  }
  return rv
}
