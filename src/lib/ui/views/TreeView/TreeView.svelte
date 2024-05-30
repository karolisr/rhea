<script lang="ts">
import NodeView from './NodeView.svelte'
import { DB } from '$lib/app/api/db'
import { buildNode } from '$lib'

export let uid: string
export let expanded = true
export let selected: string | undefined = undefined
export let selectedGroupUid: string | undefined = undefined

export let db: DB
export let tableName: string
let rebuild: number = 1
export let rootLabel: string
export let parentId: string = 'ROOT'
export let rootId: string = 'ROOT'

export let contextMenuEnabled = false
export let createNodeEnabled = false
export let deleteNodeEnabled = false
export let relabelNodeEnabled = false

let relabelId: string | undefined = undefined
let expandedIds: Set<string> = new Set()

if (expanded) {
  expandedIds.add(parentId)
  expandedIds = expandedIds
}

export let createNode: (
  parentId: string,
  label: string,
  notes: string,
  db: DB | null,
  tableName: string
) => Promise<string | null> = async () => ''

export let deleteNode: (id: string, db: DB | null, tableName: string) => Promise<string | null> = async () => null

export let relabelNode: (
  id: string,
  label: string,
  db: DB | null,
  tableName: string
) => Promise<string | null> = async () => ''

const _createNode = async (parentId: string, label: string) => {
  return createNode(parentId, label, '', db, tableName)
}
const _deleteNode = async (id: string) => {
  return deleteNode(id, db, tableName)
}
const _relabelNode = async (id: string, label: string) => {
  return relabelNode(id, label, db, tableName)
}
</script>

{#await buildNode(db, tableName, rootLabel, parentId, rootId, rebuild)}
  <div>Loading...</div>
{:then collTree}
  <NodeView
    tree="{collTree}"
    bind:relabelId
    bind:selected
    bind:selectedGroupUid
    bind:expandedIds
    bind:rebuild
    {db}
    {tableName}
    {rootLabel}
    {parentId}
    {rootId}
    {uid}
    {contextMenuEnabled}
    {createNodeEnabled}
    {deleteNodeEnabled}
    {relabelNodeEnabled}
    createNode="{_createNode}"
    deleteNode="{_deleteNode}"
    relabelNode="{_relabelNode}" />
{/await}
