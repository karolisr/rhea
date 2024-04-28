<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import { slide, fly, draw, fade, scale, blur } from 'svelte/transition'

// export let visible: boolean = false
export let x: number = 0
export let y: number = 0
export let hide: () => void

let el: HTMLElement

onMount(() => {
  addEventListener('mousedown', mousedownEvtListener, { capture: true })
})

onDestroy(() => {
  removeEventListener('mousedown', mousedownEvtListener, { capture: true })
})

const mousedownEvtListener = (e: MouseEvent) => {
  hide()
}
</script>

<!-- {#key visible} -->
<div
  id="context-menu"
  class="context-menu"
  role="menu"
  bind:this="{el}"
  in:fade="{{ duration: 150 }}"
  out:fade="{{ duration: 150 }}"
  style:left="{x}px"
  style:top="{y}px">
  <div id="context-menu-item-0" class="context-menu-item">
    <div class="context-menu-item-label">Rename</div>
    <div class="context-menu-item-right">F2</div>
  </div>
  <div id="context-menu-item-1" class="context-menu-item">
    <div class="context-menu-item-label">2</div>
    <div class="context-menu-item-right">2</div>
  </div>
  <div id="context-menu-item-separator-0" class="context-menu-item-separator">
  </div>
  <div id="context-menu-item-2" class="context-menu-item">
    <div class="context-menu-item-label">3</div>
    <div class="context-menu-item-right">3</div>
  </div>
  <div id="context-menu-item-3" class="context-menu-item">
    <div class="context-menu-item-label">4</div>
    <div class="context-menu-item-right">4</div>
  </div>
  <div id="context-menu-item-4" class="context-menu-item">
    <div class="context-menu-item-label">5</div>
    <div class="context-menu-item-right">5</div>
  </div>
</div>

<!-- {/key} -->

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
