<script lang="ts">
import { page } from '$app/stores'
import type { ComponentType } from 'svelte'

export let link: string
export let icon: ComponentType | null = null
export let label: string | null = null

$: path = $page.url.pathname
$: current = path === link
</script>

<a href="{link}" aria-current="{current}" draggable="false">
  <div>
    {#if icon !== null}
      <svelte:component this="{icon}" />
    {/if}
    {#if label}
      <span>{label}</span>
    {/if}
  </div>
</a>
