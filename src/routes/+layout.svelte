<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { themeChangeListener } from '$lib/app/api/darkmode'
import { setScale } from '$lib/app/api/scale'
import { disableDefault } from '$lib/ui'
import settings from '$lib/app/svelte-stores/settings'
import Layout from '$lib/ui/chrome/layout/Layout.svelte'
import NavMain from '$lib/ui/chrome/nav/NavMain.svelte'
import StatusBar from '$lib/ui/chrome/status/StatusBar.svelte'
import subheader from '$lib/app/svelte-stores/subheader'

let themeChangeUnListener: () => void

$: setScale($settings.scale)

onMount(async () => {
  themeChangeUnListener = await themeChangeListener()
  disableDefault('contextmenu')
})

onDestroy(() => {
  themeChangeUnListener()
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
