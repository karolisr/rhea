<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte'
import IconFolderClosed from '~icons/fa6-solid/folder-closed'
import IconFolderOpen from '~icons/fa6-solid/folder-open'
import IconFile from '~icons/fa6-solid/file'
import type { Tree } from '$lib/types'
import contextMenu from '$lib/app/svelte-stores/context-menu'
import { DB } from '$lib/app/api/db'
import { buildNode, getAllChildIds } from '$lib'
import type { ContextMenuItem } from '$lib/app/svelte-stores/context-menu'
import type { DragOverEvent, DropEvent } from '$lib/app/api/types'

onMount(async () => {
  addEventListener('mousedown', mousedownEvtListener, {
    capture: true
  })
  if (selected === tree.id) await _scrollIntoView()
})

onDestroy(() => {
  removeEventListener('mousedown', mousedownEvtListener, {
    capture: true
  })
})

export let tree: Tree
export let uid: string
export let selectedGroupUid: string | undefined = undefined
export let selected: string | undefined = undefined
export let relabelId: string | undefined = undefined
export let expandedIds: Set<string>

export let selectedLineage: string[] | undefined = undefined
export let selectedChildIds: string[] | undefined = undefined
export let selectedChildIdsEnabled: boolean = false

export let acceptedDropTypes: string[]

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
) => Promise<string | null>
export let deleteNode: (id: string) => Promise<string | null>
export let relabelNode: (id: string, label: string) => Promise<string | null>
export let addRecords: (ids: string[], collId: string) => Promise<void>
export let removeRecords: (ids: string[], collId: string) => Promise<void>

// $: setSelectedLineage(selected)

// function setSelectedLineage(selectedTreeId: string | undefined) {
//   if (selectedTreeId === tree.id) {
//     selectedLineage = tree.lineage
//   }
// }

$: if (selectedChildIdsEnabled) _getAllChildIds(selected, db, tableName, tree.id)

async function _getAllChildIds(
  selectedTreeId: string | undefined,
  db: DB,
  tableName: string = 'collections',
  parentId: string = 'ROOT'
) {
  if (selectedTreeId === tree.id) {
    selectedChildIds = await getAllChildIds(db, tableName, tree.id)
  }
}

let _deleteNode: () => void = async () => {
  if (selected === tree.id) {
    selected = tree.parent_id ? tree.parent_id : undefined
    selectedGroupUid = uid
  }
  await deleteNode(tree.id)
  rebuild += 1
}

let _createNode: (label: string) => void = async (label) => {
  const _ = await createNode(tree.id, label)
  if (_ !== null) {
    selected = _
    selectedGroupUid = uid
    tree = await buildNode(db, tableName, rootLabel, tree.id, rootId)
    expandedIds.add(tree.id)
    expandedIds = expandedIds
    relabelId = selected
  }
}

function _relabelNodeInit() {
  relabelId = tree.id
}

function relabelNodeCompleteChange(
  e: Event & {
    currentTarget: EventTarget & HTMLInputElement
  }
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

  const inputElement = document.getElementById(
    `collection-${tree.id}-label-text-input`
  ) as HTMLInputElement

  if (
    inputElement &&
    e.target instanceof HTMLElement &&
    e.target !== inputElement
  ) {
    relabelNodeComplete(inputElement)
    relabelId = undefined
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
        label: 'Create collection in "' + tree.label + '"',
        hotKey: '',
        disabled: false,
        action() {
          _createNode('New Collection')
        }
      })
    }

    if (deleteNodeEnabled) {
      contextMenuItems.push({
        label: 'Delete "' + tree.label + '"',
        hotKey: '',
        disabled: tree.id === 'ROOT' || tree.id === '1',
        action() {
          _deleteNode()
        }
      })
    }

    if (relabelNodeEnabled) {
      contextMenuItems.push({
        label: 'Rename "' + tree.label + '"',
        hotKey: '',
        disabled: tree.id === 'ROOT' || tree.id === '1',
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

async function _scrollIntoView() {
  const _ = document.getElementById(`${uid}-tree-${tree.id}`) as HTMLElement
  if (_) _.scrollIntoView()
}

function onDragOver(e: Event) {
  const ev = e as DragOverEvent
  if (
    !(selected === tree.id && selectedGroupUid === uid) &&
    acceptedDropTypes.includes(ev.payload.type)
  ) {
    ev.payload.targetCanAccept = true
  } else {
    ev.payload.targetCanAccept = false
  }
}

async function onDrop(e: Event) {
  const ev = e as DropEvent
  if (
    !(selected === tree.id && selectedGroupUid === uid) &&
    acceptedDropTypes.includes(ev.payload.type)
  ) {
    const droppedData = ev.payload.data as string[]
    await addRecords(droppedData, tree.id)
    // console.log(`"${tree.label}" received: ${droppedData.join(', ')}.`)
  }
}
</script>

{#if tree}
  <div id="{uid}-tree-{tree.id}" class="tree" style="pointer-events: none;">
    <button
      id="collection-{tree.id}"
      class="drag-target tree-node{selected === tree.id &&
      selectedGroupUid === uid
        ? ' selected'
        : ''}"
      style="pointer-events: auto;"
      on:click="{select}"
      on:dblclick="{toggleExpand}"
      on:contextmenu="{showContextMenu}"
      on:dragenter="{onDragOver}"
      on:drop="{onDrop}">
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
        <span style="pointer-events: none;">{tree.label}</span>
        <!-- <span>{tree.label} ({String(tree.child_count)})</span> -->
      {/if}
    </button>
    {#if expandedIds.has(tree.id)}
      <div class="children">
        {#each tree.children as _chld}
          {#await buildNode(db, tableName, rootLabel, _chld.id, rootId, 1, tree.lineage) then chld}
            <svelte:self
              tree="{chld}"
              bind:relabelId
              bind:selected
              bind:selectedGroupUid
              bind:expandedIds
              bind:rebuild
              bind:acceptedDropTypes
              bind:selectedLineage
              bind:selectedChildIds
              bind:selectedChildIdsEnabled
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
              {relabelNode}
              {addRecords}
              {removeRecords} />
          {/await}
        {/each}
      </div>
    {/if}
  </div>
{/if}
