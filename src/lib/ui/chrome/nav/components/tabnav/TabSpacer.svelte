<script lang="ts">
import { onDestroy, onMount } from 'svelte'

export let uid: string
export let minW: number = 0
export let collapsable: boolean = false
export let nSpacers: number = 1

let w: number | undefined
let wTabs: number = 0
let wCollapsed: number = 0
let wFree: number = 0
let elSpacer: HTMLElement | null
let navCollapsed: boolean = false

function collapse() {
  if (!collapsable) return
  if (elSpacer) w = elSpacer.offsetWidth
  wFree = document.documentElement.offsetWidth - minW

  if (!navCollapsed && w && w > minW) {
    wTabs = document.documentElement.offsetWidth - w * nSpacers
  }

  if (navCollapsed && w && w > minW) {
    wCollapsed = document.documentElement.offsetWidth - w * nSpacers
    if (wTabs === 0) {
      wTabs = wCollapsed * 2.5
    }
  }

  if (!navCollapsed && w && w <= minW) {
    navCollapsed = true
  }

  if (navCollapsed && w && w > minW && wTabs !== 0 && wFree > wTabs) {
    if (wTabs >= wCollapsed * 2.25) {
      navCollapsed = false
    } else {
      wTabs = 1 + wCollapsed * 2.25
    }
  }
}

$: document.documentElement.setAttribute(`${uid}-nav-collapsed`, String(navCollapsed))

const _onResize = (_: UIEvent) => {
  collapse()
}

onMount(() => {
  elSpacer = document.getElementById(`${uid}-tab-nav-tab-spacer`)
  if (elSpacer) window.addEventListener('resize', _onResize)
  collapse()
})

onDestroy(() => {
  window.removeEventListener('resize', _onResize)
})
</script>

<div id="{uid}-tab-nav-tab-spacer" data-tauri-drag-region class="tab-nav-tab-spacer" style="min-width: {minW}px;"></div>

<style lang="scss">
.tab-nav-tab-spacer {
  flex-grow: 1;
  flex-shrink: 1;
}
</style>
