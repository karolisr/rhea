<script lang="ts">
import { onMount } from 'svelte'
import { themeChangeListener } from '$lib/app/api/darkmode'
import { disableDefault } from '$lib/app/ui'
import Layout from '$lib/app/ui/layout/Layout.svelte'
import NavMain from '$lib/app/ui/nav/NavMain.svelte'
import StatusBar from '$lib/app/ui/status/StatusBar.svelte'

onMount(() => {
  disableDefault('contextmenu')
  // Note: If a function is returned synchronously from onMount,
  //       it will be called when the component is unmounted.
  return themeChangeListener()
})
</script>

<Layout hd mn ft>
  <div slot="hd"><NavMain /></div>
  <div slot="mn"><slot /></div>
  <div slot="ft"><StatusBar /></div>
</Layout>
