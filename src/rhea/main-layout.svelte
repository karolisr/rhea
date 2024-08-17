<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import type { ComponentType } from 'svelte'

import { gSysInfo } from '$lib/backend/system-info'
// import { setAppScale } from '$lib/utils'
import { DragDropFiles } from '$lib/backend/drag-drop'
import { themeChangeListener } from '$lib/backend/dark-mode'

// import { appSettings } from '$lib/stores/settings'
import { applyAppSettings } from '$lib/stores/settings'
applyAppSettings()

import { preventDefault } from '$lib/utils'
import type { Unlistener } from '$lib/types'

let unlisteners: Unlistener[] = []
let dragDropConductor: DragDropFiles | null = null

// $: setAppScale($appSettings.scale)

onMount(async () => {
  console.info(
    gSysInfo.browser,
    gSysInfo.engine,
    `Pixel ratio: ${gSysInfo.pixelRatio}`
  )
  dragDropConductor = new DragDropFiles()

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

onDestroy(async () => {
  if (dragDropConductor) await dragDropConductor.unlisten()
  unlisteners.forEach((f) => {
    f()
  })
})
</script>
