import type { Tree } from '$lib/types'
import {
  getCollections,
  getCollectionsCount
} from '$lib/app/api/db/collections'
import { DB } from '$lib/app/api/db'

export async function getAllChildIds(
  db: DB,
  tableName: string = 'collections',
  parentId: string = 'ROOT'
) {
  const nodes = await getCollections([parentId], true, db, tableName)
  const ids = nodes.map((c) => c.id)
  let rv = [parentId, ...ids]
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    rv = [...rv, ...(await getAllChildIds(db, tableName, id))]
  }
  return rv
}

export async function buildNode(
  db: DB,
  tableName: string = 'collections',
  rootLabel: string = 'Collections',
  parentId: string = 'ROOT',
  rootId: string = 'ROOT',
  rebuild: number = 1,
  lineage: string[] = []
) {
  const p = (await getCollections([parentId], false, db, tableName))[0]
  const nodes = await getCollections([parentId], true, db, tableName)
  if (p.label === rootId || p.label === 'root') p.label = rootLabel
  let rv: Tree = {
    child_count: nodes.length,
    children: [],
    label: p.label,
    id: String(p.id),
    parent_id: '',
    notes: p.notes,
    lineage: [...lineage, String(p.id)]
  }
  const rvp = rv['children'] as object[]
  if (nodes.length > 0) {
    nodes.sort((a, b) => {
      return a.label < b.label ? -1 : 1
    })
    const childIds = nodes.map((n) => n.id)
    const childCounts = await getCollectionsCount(childIds, true, db, tableName)
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const childId = String(n.id)
      if (childId === parentId) continue
      const child_count = childCounts[n.id] ?? 0
      const c: Tree = {
        child_count,
        children: [],
        label: n.label,
        id: childId,
        parent_id: parentId,
        notes: n.notes,
        lineage: [...rv.lineage, childId]
      }
      rvp.push(c)
    }
  }
  return rv
}
