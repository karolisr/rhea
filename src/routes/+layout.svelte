<script lang="ts">
import { initMainMenu } from '$rhea/main-menu'
import MainLayout from '$rhea/main-layout.svelte'
import type { LayoutData } from './$types'
export let data: LayoutData
initMainMenu()
import Layout from '$lib/ui/layout/Layout.svelte'
import MainNav from '$rhea/main-nav.svelte'
import StatusBar from '$lib/ui/StatusBar.svelte'
</script>

<MainLayout></MainLayout>

<Layout
  hd
  subhd
  mn
  ft>
  <svelte:fragment slot="hd"><MainNav /></svelte:fragment>
  <svelte:fragment slot="subhd">
    {#if data.layout.subheader !== undefined}
      <svelte:component this="{data.layout.subheader}" />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="mn"><slot /></svelte:fragment>
  <svelte:fragment slot="ft"><StatusBar /></svelte:fragment>
</Layout>
