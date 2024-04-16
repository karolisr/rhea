<script lang="ts">
import { page } from '$app/stores'
import type { ComponentType } from 'svelte'

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
</script>

<a
  id="{link}"
  href="{link}"
  aria-current="{curr}"
  draggable="false"
  tabindex="-1">
  <div>
    {#if icon !== null}
      <svelte:component this="{icon}" />
    {/if}
    {#if label}
      <span>{label}</span>
    {/if}
  </div>
</a>
