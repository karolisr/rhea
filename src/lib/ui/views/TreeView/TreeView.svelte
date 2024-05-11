<script lang="ts">
import NodeView from './NodeView.svelte'
import { DB } from '$lib/app/api/db'
import { buildTree } from '$lib'

export let uid: string
export let expanded = true
export let selected: string | undefined = undefined
export let db: DB
export let tableName: string

let relabelId: string | undefined = undefined
let rebuild: number = 1

export let createNode: (
  parentId: string,
  label: string,
  notes: string,
  db: DB,
  tableName: string
) => Promise<string>
export let deleteNode: (
  id: string,
  db: DB,
  tableName: string
) => Promise<string | null>
export let relabelNode: (
  id: string,
  label: string,
  db: DB,
  tableName: string
) => Promise<string>

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

{#await buildTree(db, tableName, rebuild) then collTree}
  <NodeView
    tree="{collTree}"
    bind:relabelId
    bind:selected
    bind:rebuild
    {uid}
    {expanded}
    createNode="{_createNode}"
    deleteNode="{_deleteNode}"
    relabelNode="{_relabelNode}" />
{/await}
