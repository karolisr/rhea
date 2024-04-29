<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import IconFolderClosed from '~icons/fa6-solid/folder-closed'
import IconFolderOpen from '~icons/fa6-solid/folder-open'
import type { Tree } from '$lib/types'
import contextMenu from '$lib/app/svelte-stores/context-menu'

onMount(() => {
  addEventListener('mousedown', mousedownEvtListener, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousedown', mousedownEvtListener, { capture: true })
})

export let tree: Tree
export let uid: string
export let selected: string | undefined
export let relabelId: string | undefined
export let expanded: boolean
export let relabelNode: (id: string, label: string) => void
export let createNode: (parentId: string, label: string) => Promise<string>
export let deleteNode: (id: string) => void

let _deleteNode: () => void = () => {
  if (selected === tree.id) selected = tree.parentId
  deleteNode(tree.id)
}

let _createNode: (label: string) => void = async (label) => {
  selected = await createNode(tree.id, label)
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
}

const mousedownEvtListener = (e: MouseEvent) => {
  if (
    e.button === 0 &&
    e.target instanceof HTMLElement &&
    e.target.id === `${uid}-tree-${tree.id}`
  ) {
    selected = undefined
  }
}

function select(e: MouseEvent) {
  selected = tree.id
}

function toggleExpand() {
  expanded = !expanded
}

function showContextMenu(e: MouseEvent) {
  $contextMenu.show(e, [
    {
      label: 'New Collection',
      hotKey: '',
      disabled: false,
      action() {
        _createNode('New Collection')
      }
    },
    {
      label: 'Delete Collection',
      hotKey: '',
      disabled: tree.id === 'ROOT',
      action() {
        _deleteNode()
      }
    },
    {
      label: 'Rename Collection',
      hotKey: '',
      disabled: tree.id === 'ROOT',
      action() {
        _relabelNodeInit()
      }
    }
  ])
}

function elFocus(el: HTMLInputElement) {
  selected = tree.id
  el.focus()
  el.select()
  el.click()
}
</script>

<div id="{uid}-tree-{tree.id}" class="tree">
  <button
    id="collection-{tree.id}"
    class="tree-node{selected === tree.id ? ' selected' : ''}"
    on:click="{select}"
    on:dblclick="{toggleExpand}"
    on:contextmenu="{showContextMenu}">
    {#if expanded}
      <IconFolderOpen />
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
      <span>{tree.label}</span>
    {/if}
  </button>
  {#if expanded && tree.children.length > 0}
    <div class="children">
      {#each tree.children as chld}
        <svelte:self
          tree="{chld}"
          bind:selected
          bind:relabelId
          {uid}
          {expanded}
          {createNode}
          {deleteNode}
          {relabelNode} />
      {/each}
    </div>
  {/if}
</div>
