<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { BROWSER, ENGINE, PIXELRATIO } from '$lib/api'
import { themeChangeListener } from '$lib/api/darkmode'
import type { Unlistener } from '$lib/types'
import settings from '$lib/svelte-stores/settings'
import { setScale } from '$lib/api'
import { preventDefault } from '$lib/ui'
import Layout from '$lib/ui/chrome/layout/Layout.svelte'
import MainNav from './main-nav.svelte'
import StatusBar from '$lib/ui/chrome/status/StatusBar.svelte'
import subheader from '$lib/svelte-stores/subheader'
import { DragDrop } from '$lib/api/drag-drop'

let unlisteners: Unlistener[] = []
let dragDropConductor: DragDrop = new DragDrop()

$: setScale($settings.scale)

onMount(async () => {
  console.info(BROWSER, ENGINE, `Pixel ratio: ${PIXELRATIO}`)
  unlisteners.push(await themeChangeListener())

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
})

onDestroy(() => {
  dragDropConductor.unlisten()
  unlisteners.forEach((f) => {
    f()
  })
})
</script>

<Layout hd subhd mn ft>
  <svelte:fragment slot="hd"><MainNav /></svelte:fragment>
  <svelte:fragment slot="subhd">
    {#if $subheader !== undefined}
      <svelte:component this="{$subheader}" />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="mn"><slot /></svelte:fragment>
  <svelte:fragment slot="ft"><StatusBar /></svelte:fragment>
</Layout>
