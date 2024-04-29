<script lang="ts">
// import type { Tree } from '$lib/types'
import type { Readable } from 'svelte/store'
import type { DBMainSvelteStore } from '$lib/app/svelte-stores/db-main'
import NodeView from './NodeView.svelte'
// export let tree: Tree
export let uid: string
export let selected: string | undefined = undefined
let relabelId: string | undefined = undefined
export let expanded = true
export let relabelNode: (id: string, label: string) => void
export let createNode: (parentId: string, label: string) => Promise<string>
export let deleteNode: (id: string) => void
export let _db_main: Readable<DBMainSvelteStore>
import { buildTree } from '$lib'
</script>

{#await buildTree($_db_main) then collTree}
  <NodeView
    tree="{collTree}"
    bind:relabelId
    bind:selected
    {uid}
    {expanded}
    {createNode}
    {deleteNode}
    {relabelNode} />
{/await}
