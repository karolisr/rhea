<script lang="ts">
import { type CollTree } from '.'
import IconFolderClosed from '~icons/fa6-solid/folder-closed'
import IconFolderOpen from '~icons/fa6-solid/folder-open'

import { onDestroy, onMount } from 'svelte'

onMount(() => {
  addEventListener('mousedown', mousedownEvtListener, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousedown', mousedownEvtListener, { capture: true })
})

export let selected: string | undefined = undefined

const mousedownEvtListener = (e: MouseEvent) => {
  if (
    e.button === 0 &&
    e.target instanceof HTMLElement &&
    e.target.id === `${uid}-tree-${obj.id}`
  ) {
    selected = undefined
  }
}

function select(e: MouseEvent) {
  selected = obj.id
}

export let obj: CollTree
export let expanded = true
export let uid: string

function toggleExpand() {
  expanded = !expanded
}
</script>

<div id="{uid}-tree-{obj.id}" class="tree">
  <button
    id="collection-{obj.id}"
    class="tree-node{selected === obj.id ? ' selected' : ''}"
    on:click="{select}"
    on:dblclick="{toggleExpand}">
    {#if expanded}
      <IconFolderOpen />
    {:else}
      <IconFolderClosed />
    {/if}
    {obj.label}
  </button>
  {#if expanded}
    <div class="children">
      {#each obj.children as chld}
        <svelte:self obj="{chld}" bind:selected bind:uid />
      {/each}
    </div>
  {/if}
</div>
