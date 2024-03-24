<script lang="ts">
// @ts-nocheck
import type { Indexed } from '$lib/types'
import { A } from 'flowbite-svelte'
import { cbw } from '$lib/app/api/clipboard'
import { getPropNames } from '$lib'

export let name: string | undefined = undefined
$: key = name ? name.split(' ')[0].split(':')[0] : undefined

export let obj: Indexed
export let expanded = false
export let hideName = false

if (hideName) expanded = true

function toggleExpand() {
  expanded = !expanded
}

const _oncontextmenu: typeof oncontextmenu = (event) => {
  let _: Indexed = {}
  if (key) {
    _[key] = obj
  } else {
    _ = obj
  }
  cbw(JSON.stringify(_))
  console.log(`Copied JSON representation of "${key}" to clipboard.`)
}

function isPrimitiveArray(array: Array<unknown>): boolean {
  return array.every(
    (i) =>
      typeof i === 'string' || typeof i === 'number' || typeof i === 'boolean'
  )
}

let objectIsPrimitiveArray = false
let nodeNames: string[] = []

if (obj instanceof Array && isPrimitiveArray(obj)) {
  objectIsPrimitiveArray = true
} else {
  nodeNames = getPropNames(obj).sort()
}
</script>

{#if obj instanceof Array}
  {#if objectIsPrimitiveArray}
    <span class="node-name">{name}</span>:&nbsp;<span class="node-value"
      >{obj.toString().replaceAll(',', ', ')}</span>
  {:else}
    {#each obj as item, i}
      <ul
        class="my-1 border-b border-b-slate-300 bg-slate-400 bg-opacity-5 p-0.5 px-1">
        <li>
          <svelte:self name="{`${name}: ${i + 1}`}" obj="{item}" />
        </li>
      </ul>
    {/each}
  {/if}
{:else if !hideName}
  <A on:click="{toggleExpand}"
    ><div
      on:contextmenu="{_oncontextmenu}"
      role="button"
      tabindex="0"
      class="w-svw hover:bg-yellow-200 hover:bg-opacity-25">
      <span class="node-name">{name}</span>
    </div></A>
{:else if getPropNames(obj).length === 0}
  <span class="node-name">Empty Object</span>
{/if}

{#if expanded}
  <ul class:show-border="{!hideName}">
    {#each nodeNames as leafName, i}
      <li>
        {#if obj[leafName] instanceof Object}
          <!-- ToDo: fix type errors and then remove @ts-nocheck -->
          {#if getPropNames(obj[leafName]).length === 1 && obj[leafName] instanceof Object && obj[leafName][getPropNames(obj[leafName])[0]] instanceof Array}
            <svelte:self
              name="{`${leafName} (${obj[leafName][getPropNames(obj[leafName])[0]].length})`}"
              obj="{obj[leafName]}" />
          {:else}
            <svelte:self name="{leafName}" obj="{obj[leafName]}" />
          {/if}
        {:else}
          <span class="node-name">{leafName}</span>:&nbsp;<span
            class="node-value">
            {#if obj[leafName]}
              {obj[leafName].toString().substring(0, 1000)}
            {:else}
              {obj[leafName]}
            {/if}
          </span>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
ul {
  list-style: none;
  max-width: 90vmax;
  user-select: text;
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
  user-select: text;
}

.node-name {
  font-weight: bold;
  user-select: text;
}

.node-value {
  color: blue;
  user-select: text;
}
</style>
