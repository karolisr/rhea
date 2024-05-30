<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { BROWSER, ENGINE } from '$lib/app/api'
import { themeChangeListener } from '$lib/app/api/darkmode'
import { FileDragDrop } from '$lib/app/api/file-drag-drop'
import type { Unlistener } from '$lib/types'
import settings from '$lib/app/svelte-stores/settings'
import { setScale } from '$lib/app/api'
import { preventDefault } from '$lib/ui'
import Layout from '$lib/ui/chrome/layout/Layout.svelte'
import NavMain from './nav.svelte'
import StatusBar from '$lib/ui/chrome/status/StatusBar.svelte'
import subheader from '$lib/app/svelte-stores/subheader'
import { DragDrop } from '$lib/app/api/drag-drop'

// import databases from '$lib/app/svelte-stores/databases'
// let dbs: Awaited<typeof databases>

let unlisteners: Unlistener[] = []

$: setScale($settings.scale)

onMount(async () => {
  console.log(BROWSER, ENGINE)
  unlisteners.push(await themeChangeListener())
  unlisteners.push(await new FileDragDrop().unlisten)
  unlisteners.push(new DragDrop().unlisten)

  unlisteners.push(preventDefault('contextmenu'))

  // source -----------------------------------------------------------------
  unlisteners.push(preventDefault('dragstart'))
  unlisteners.push(preventDefault('drag'))
  unlisteners.push(preventDefault('dragend'))

  // target -----------------------------------------------------------------
  unlisteners.push(preventDefault('dragenter'))
  unlisteners.push(preventDefault('dragover'))
  unlisteners.push(preventDefault('dragleave'))
  unlisteners.push(preventDefault('drop'))

  // dbs = await databases
})

onDestroy(() => {
  unlisteners.forEach((f) => {
    f()
  })
})
</script>

<Layout hd subhd mn ft>
  <svelte:fragment slot="hd"><NavMain /></svelte:fragment>
  <svelte:fragment slot="subhd">
    {#if subheader}
      <svelte:component this="{$subheader}" />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="mn"><slot /></svelte:fragment>
  <svelte:fragment slot="ft"><StatusBar /></svelte:fragment>
</Layout>
