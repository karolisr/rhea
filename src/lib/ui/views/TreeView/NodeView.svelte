<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import IconFolderClosed from '~icons/fa6-solid/folder-closed'
import IconFolderOpen from '~icons/fa6-solid/folder-open'
import IconFile from '~icons/fa6-solid/file'
import type { Tree } from '$lib/types'
import contextMenu from '$lib/app/svelte-stores/context-menu'
import { DB } from '$lib/app/api/db'
import { buildNode } from '$lib'
import type { ContextMenuItem } from '$lib/app/svelte-stores/context-menu'

onMount(async () => {
  addEventListener('mousedown', mousedownEvtListener, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousedown', mousedownEvtListener, { capture: true })
})

export let tree: Tree
export let uid: string
export let selectedGroupUid: string | undefined = undefined
export let selected: string | undefined = undefined
export let relabelId: string | undefined = undefined
export let expandedIds: Set<string>

export let rebuild: number

export let db: DB
export let tableName: string
export let rootLabel: string
export let parentId: string = 'ROOT'
export let rootId: string = 'ROOT'

export let contextMenuEnabled: boolean
export let createNodeEnabled: boolean
export let deleteNodeEnabled: boolean
export let relabelNodeEnabled: boolean

export let createNode: (
  parentId: string,
  label: string
) => Promise<string> = async () => ''
export let deleteNode: (id: string) => Promise<string | null> = async () => null
export let relabelNode: (
  id: string,
  label: string
) => Promise<string> = async () => ''

let _deleteNode: () => void = async () => {
  if (selected === tree.id) {
    selected = tree.parent_id ? tree.parent_id : undefined
    selectedGroupUid = uid
  }
  await deleteNode(tree.id)
  rebuild += 1
}

let _createNode: (label: string) => void = async (label) => {
  selected = await createNode(tree.id, label)
  selectedGroupUid = uid
  tree = await buildNode(db, tableName, rootLabel, tree.id, rootId)
  expandedIds.add(tree.id)
  expandedIds = expandedIds
  relabelId = selected
}

function _relabelNodeInit() {
  relabelId = tree.id
}

function relabelNodeCompleteChange(
  e: Event & { currentTarget: EventTarget & HTMLInputElement }
) {
  const target = e.target as HTMLInputElement
  relabelNodeComplete(target)
}

function relabelNodeCompleteKeyboard(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === 'Tab') {
    const target = e.target as HTMLInputElement
    relabelNodeComplete(target)
  } else if (e.key === 'Escape') {
    relabelId = undefined
  }
}

function relabelNodeComplete(target: HTMLInputElement) {
  relabelNode(tree.id, target.value)
  tree.label = target.value
  relabelId = undefined
  rebuild += 1
}

const mousedownEvtListener = (e: MouseEvent) => {
  if (
    e.button === 0 &&
    e.target instanceof HTMLElement &&
    e.target.id === `${uid}-tree-${tree.id}`
  ) {
    selected = undefined
    selectedGroupUid = undefined
  }
}

function select(e: MouseEvent) {
  selected = tree.id
  selectedGroupUid = uid
}

async function toggleExpand() {
  if (!expandedIds.has(tree.id)) {
    if (tree.child_count > 0) {
      expandedIds.add(tree.id)
    }
  } else {
    expandedIds.delete(tree.id)
  }
  expandedIds = expandedIds
}

function showContextMenu(e: MouseEvent) {
  if (contextMenuEnabled) {
    const contextMenuItems: ContextMenuItem[] = []

    if (createNodeEnabled) {
      contextMenuItems.push({
        label: 'New Collection',
        hotKey: '',
        disabled: false,
        action() {
          _createNode('New Collection')
        }
      })
    }

    if (deleteNodeEnabled) {
      contextMenuItems.push({
        label: 'Delete Collection',
        hotKey: '',
        disabled: tree.id === 'ROOT',
        action() {
          _deleteNode()
        }
      })
    }

    if (relabelNodeEnabled) {
      contextMenuItems.push({
        label: 'Rename Collection',
        hotKey: '',
        disabled: tree.id === 'ROOT',
        action() {
          _relabelNodeInit()
        }
      })
    }

    $contextMenu.show(e, contextMenuItems)
  }
}

function elFocus(el: HTMLInputElement) {
  selected = tree.id
  selectedGroupUid = uid
  el.focus()
  el.select()
  el.click()
}
</script>

{#if tree}
  <div id="{uid}-tree-{tree.id}" class="tree">
    <button
      id="collection-{tree.id}"
      class="tree-node{selected === tree.id && selectedGroupUid === uid
        ? ' selected'
        : ''}"
      on:click="{select}"
      on:dblclick="{toggleExpand}"
      on:contextmenu="{showContextMenu}">
      {#if expandedIds.has(tree.id)}
        {#if tree.child_count === 0}
          <IconFile />
        {:else}
          <IconFolderOpen />
        {/if}
      {:else if tree.child_count === 0}
        <IconFile />
      {:else}
        <IconFolderClosed />
      {/if}
      {#if relabelId === tree.id}
        <input
          use:elFocus
          id="collection-{tree.id}-label-text-input"
          type="text"
          value="{tree.label}"
          spellcheck="false"
          autocomplete="off"
          on:change="{relabelNodeCompleteChange}"
          on:keydown="{relabelNodeCompleteKeyboard}" />
      {:else}
        <span>{tree.label} ({String(tree.child_count)})</span>
      {/if}
    </button>
    {#if expandedIds.has(tree.id)}
      <div class="children">
        {#each tree.children as _chld}
          {#await buildNode(db, tableName, rootLabel, _chld.id, rootId) then chld}
            <svelte:self
              tree="{chld}"
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
              {createNode}
              {deleteNode}
              {relabelNode} />
          {/await}
        {/each}
      </div>
    {/if}
  </div>
{/if}
