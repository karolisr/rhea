<script lang="ts">
// @ts-nocheck
import type { IndexedUndefined } from '$lib/types'
import { cbw } from '$lib/app/api/clipboard'
import { getPropNames } from '$lib'

export let name: string | undefined = undefined
$: key = name ? name.split(' ')[0].split(':')[0] : undefined

export let obj: IndexedUndefined
export let expanded = false
export let hideName = false

if (hideName) expanded = true

function toggleExpand() {
  expanded = !expanded
}

const _oncontextmenu: typeof oncontextmenu = (event) => {
  let _: IndexedUndefined = {}
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

{#if !hideName}
  <button
    on:click="{toggleExpand}"
    on:contextmenu="{_oncontextmenu}"
    type="button"><span class="node-name">{name}</span></button>
{/if}
{#if obj instanceof Array}
  {#if objectIsPrimitiveArray}
    <!-- <span class="node-name">{name}</span>:&nbsp;<span class="node-value"
      >{obj.toString().replaceAll(',', ', ')}</span> -->
  {:else if expanded}
    {#each obj as item, i}
      <ul class:no-indent="{hideName}">
        <!-- <li> -->
        <!-- <svelte:self name="{`${name}: ${i + 1}`}" obj="{item}" /> -->
        <svelte:self hideName obj="{item}" />
        <!-- </li> -->
      </ul>
    {/each}
  {/if}
{:else if getPropNames(obj).length === 0}
  <span class="node-name">Empty Object</span>
{/if}

{#if expanded && !(obj instanceof Array)}
  <!-- <ul class:show-border="{!hideName}" class:no-indent="{hideName}"> -->
    {#each nodeNames as leafName, i}
      {#if obj[leafName] instanceof Object}
        <li>
          <!-- ToDo: fix type errors and then remove @ts-nocheck -->
          {#if getPropNames(obj[leafName]).length === 1 && obj[leafName] instanceof Object && obj[leafName][getPropNames(obj[leafName])[0]] instanceof Array}
            <svelte:self
              name="{`${leafName} (${obj[leafName][getPropNames(obj[leafName])[0]].length})`}"
              obj="{obj[leafName]}" />
          {:else}
            <svelte:self name="{leafName}" obj="{obj[leafName]}" {expanded} />
          {/if}
        </li>
      {:else}
        <!-- <li>
          <span class="node-name">{leafName}</span>:&nbsp;<span
            class="node-value">
            {#if obj[leafName]}
              {obj[leafName]?.toString().substring(0, 1000)}
            {:else}
              {obj[leafName]}
            {/if}
          </span>
        </li> -->
      {/if}
    {/each}
  <!-- </ul> -->
{/if}

<style lang="scss">
ul.no-indent {
  padding-inline-start: 0;
}
</style>
