<script lang="ts">
import { page } from '$app/stores'
import type { ComponentType } from 'svelte'

export let link: string
export let icon: ComponentType | null = null
export let label: string | null = null

$: path = $page.url.pathname
$: current = path === link
</script>

<a
  id="{link}"
  href="{link}"
  aria-current="{current}"
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
