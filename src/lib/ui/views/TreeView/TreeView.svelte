<script lang="ts">
import { type CollTree } from '.'

import IconFolderClosed from '~icons/fa6-solid/folder-closed'
import IconFolderOpen from '~icons/fa6-solid/folder-open'

export let obj: CollTree
export let expanded = false

function toggleExpand() {
  expanded = !expanded
}
</script>

<div class="tree">
  <button class="tree-node" on:click="{toggleExpand}">
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
        <svelte:self obj="{chld}" />
      {/each}
    </div>
  {/if}
</div>
