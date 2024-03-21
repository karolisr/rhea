<script lang="ts">
// @ts-nocheck
import type { Indexed } from '$lib/types'
import { A } from 'flowbite-svelte'

export let name: string | undefined = undefined
export let obj: Indexed
export let expanded = false
export let hideName = false

if (hideName) expanded = true

function toggle() {
  expanded = !expanded
}

let nodeNames = Object.getOwnPropertyNames(obj)
</script>

{#if obj instanceof Array}
  {#each obj as arrayObj, i}
    <ul
      class="my-1 border-b border-b-slate-300 bg-slate-400 bg-opacity-5 p-0.5 px-1">
      <li>
        <svelte:self name="{`${name}: ${i + 1}`}" obj="{arrayObj}" />
      </li>
    </ul>
  {/each}
{:else if !hideName}
  <A on:click="{toggle}"
    ><div class="w-svw"><span class="node-name">{name}</span></div></A>
{/if}

{#if expanded}
  <ul class:show-border="{!hideName}">
    {#each nodeNames as leafName}
      <li>
        {#if obj[leafName] instanceof Object}
          <!-- ToDo: fix type errors and then remove @ts-nocheck -->
          {#if Object.getOwnPropertyNames(obj[leafName]).length === 1 && obj[leafName] instanceof Object && obj[leafName][Object.getOwnPropertyNames(obj[leafName])[0]] instanceof Array}
            <svelte:self
              name="{`${leafName} (${obj[leafName][Object.getOwnPropertyNames(obj[leafName])[0]].length})`}"
              obj="{obj[leafName]}" />
          {:else}
            <svelte:self name="{leafName}" obj="{obj[leafName]}" />
          {/if}
        {:else}
          <span class="node-name">{leafName}</span>:&nbsp;<span
            class="node-value"
            >{obj[leafName].toString().substring(0, 1000)}</span>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
ul {
  list-style: none;
  max-width: 90vmax;
}

.show-border {
  border-left: 1px solid rgba(128, 128, 128, 0.4);
  margin: 0 0 0 0.5em;
  padding: 0em 0 0 0.5em;
}

li {
  padding: 0em 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-name {
  font-weight: bold;
}

.node-value {
  color: blue;
}
</style>
