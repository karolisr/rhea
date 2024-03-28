<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { themeChangeListener } from '$lib/app/api/darkmode'
import { disableDefault } from '$lib/app/ui'
import Layout from '$lib/app/ui/chrome/layout/Layout.svelte'
import NavMain from '$lib/app/ui/chrome/nav/NavMain.svelte'
import StatusBar from '$lib/app/ui/chrome/status/StatusBar.svelte'
import subheader from '$lib/app/svelte-stores/subheader'

let themeChangeUnListener: () => void

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
