<script lang="ts">
import TabNav from '$lib/ui/tab-nav/TabNav.svelte'
import TabSpacer from '$lib/ui/tab-nav/TabSpacer.svelte'
import Tab from '$lib/ui/tab-nav/Tab.svelte'

import iconHome from '~icons/fa6-solid/house-chimney'
import iconSettings from '~icons/fa6-solid/gear'
import iconDebug from '~icons/fa6-solid/bug'
</script>

<TabNav
  uid="chrome-nav-main"
  navClass="nav-main">
  <TabSpacer
    uid="chrome-nav-main-left-spacer"
    minW="{68}"
    collapsable />
  <Tab
    link="/"
    icon="{iconHome}"
    label="Home" />
  <Tab
    link="/debug/"
    icon="{iconDebug}"
    label="Debug"
    current="base" />
  <Tab
    link="/settings/"
    icon="{iconSettings}"
    label="Settings" />
</TabNav>
