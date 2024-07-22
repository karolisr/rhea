<script lang="ts">
import TabNav from '$lib/ui/chrome/nav/components/tabnav/TabNav.svelte'
import TabSpacer from '$lib/ui/chrome/nav/components/tabnav/TabSpacer.svelte'
import Tab from '$lib/ui/chrome/nav/components/tabnav/Tab.svelte'

import iconHome from '~icons/fa6-solid/house-chimney'
import iconSettings from '~icons/fa6-solid/gear'
// import iconSearch from '~icons/fa6-solid/magnifying-glass'
import iconDebug from '~icons/fa6-solid/bug'
</script>

<TabNav uid="chrome-nav-main" navClass="nav-main">
  <TabSpacer uid="chrome-nav-main-left-spacer" minW="{68}" collapsable />
  <Tab link="/" icon="{iconHome}" label="Home" />
  <!-- <Tab link="/home-prev/" icon="{iconHome}" label="HomePrev" /> -->
  <!-- <Tab link="/search/" icon="{iconSearch}" label="Search" /> -->
  <Tab link="/debug/" icon="{iconDebug}" label="Debug" current="base" />
  <Tab link="/settings/" icon="{iconSettings}" label="Settings" />
</TabNav>
