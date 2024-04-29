<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import { fade } from 'svelte/transition'
import type { ContextMenuItem } from '$lib/app/svelte-stores/context-menu'

export let x: number
export let y: number
export let hide: () => void
export let items: ContextMenuItem[]

onMount(() => {
  addEventListener('mousedown', mousedownEvtListener, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousedown', mousedownEvtListener, { capture: true })
})

const mousedownEvtListener = (e: MouseEvent) => {
  e.preventDefault()
  const target = e.target
  const targetId = target instanceof HTMLElement ? target.id : ''
  if (targetId.startsWith('context-menu-item')) {
    const itemId = Number((targetId.match(/\-(\d+)/) as string[])[1])
    if (!items[itemId].disabled) {
      const action = items[itemId].action
      if (action !== undefined) action()
    }
  }
  hide()
}
</script>

<div
  id="context-menu"
  class="context-menu"
  role="menu"
  in:fade="{{ duration: 150 }}"
  out:fade="{{ duration: 150 }}"
  style:left="{x}px"
  style:top="{y}px">
  {#each items as item, i}
    {#if item.label !== undefined}
      <div
        id="context-menu-item-{i}"
        class="context-menu-item{item.disabled ? ' disabled' : ''}"
        role="menuitem">
        <div class="context-menu-item-label">{item.label}</div>
        <div class="context-menu-item-right">{item.hotKey}</div>
      </div>
    {:else}
      <div id="context-menu-item-separator" class="context-menu-item-separator">
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
.context-menu {
  position: absolute;
  background-color: rgba(236, 236, 236, $alpha: 1);
  border-style: solid;
  border-color: rgba($color: black, $alpha: 0.15);
  z-index: 1000;
  box-shadow: 0px 2px 10px 2px rgba($color: black, $alpha: 0.15);
  border-radius: 6px;
  display: grid;
  grid-template-columns: repeat(1, auto);
  grid-template-rows: repeat(auto-fill, auto);
  padding-inline: 5px;
  padding-block: 5px;
  column-gap: 10px;
}

.context-menu-item {
  display: grid;
  grid-template-columns: 7fr 1fr;
  padding-inline: 20px;
  padding-block: 4px;
  border-radius: 3px;
  align-items: center;
}

.context-menu-item.disabled {
  pointer-events: none;
  color: grey;
}

.context-menu-item-label {
  pointer-events: none;
}

.context-menu-item-right {
  font-size: 0.75rem;
  text-align: center;
  pointer-events: none;
}

.context-menu-item:hover {
  background-color: rgba(0, 100, 225, 1);
  color: white;
}

.context-menu-item-separator {
  border-color: rgba(212, 212, 212, 1);
  margin-inline: 10px;
  margin-block: 5px;
  min-width: 0px;
  border-block-start-style: solid;
}
</style>
