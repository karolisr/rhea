<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { themeChangeListener } from '$lib/app/api/darkmode'
import { disableDefault } from '$lib/app/ui'
import Layout from '$lib/app/ui/layout/Layout.svelte'
import NavMain from '$lib/app/ui/nav/NavMain.svelte'
import StatusBar from '$lib/app/ui/status/StatusBar.svelte'

let themeChangeUnListener: () => void

onMount(async () => {
  themeChangeUnListener = await themeChangeListener()
  disableDefault('contextmenu')
})

onDestroy(() => {
  themeChangeUnListener()
})
</script>

<Layout hd mn ft>
  <div slot="hd"><NavMain /></div>
  <div slot="mn"><slot /></div>
  <div slot="ft"><StatusBar /></div>
</Layout>
