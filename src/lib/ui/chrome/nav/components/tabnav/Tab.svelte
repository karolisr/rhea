<script lang="ts">
import { page } from '$app/stores'
import { onMount, type ComponentType } from 'svelte'

export let link: string
export let current: 'equals' | 'startsWith' = 'equals'
export let icon: ComponentType | null = null
export let label: string | null = null

let curr: boolean = false

$: path = $page.url.pathname
$: {
  if (current === 'equals') {
    curr = path === link
  }

  if (current === 'startsWith') {
    curr = path.startsWith(link)
  }
}

onMount(() => {
  const elSvg = document.getElementById(`chrome-nav-a-${label}-div-icon`)
  const elSvgPath = elSvg?.getElementsByTagName('path')
  if (elSvgPath && elSvgPath.length > 0) {
    elSvgPath[0].id = `chrome-nav-a-${label}-div-icon-path`
  }
})
</script>

<a
  id="chrome-nav-a-{label}"
  href="{link}"
  aria-current="{curr}"
  draggable="false"
  tabindex="-1">
  <div id="chrome-nav-a-{label}-div">
    {#if icon !== null}
      <svelte:component id="chrome-nav-a-{label}-div-icon" this="{icon}" />
    {/if}
    {#if label}
      <span id="chrome-nav-a-{label}-div-label">{label}</span>
    {/if}
  </div>
</a>
