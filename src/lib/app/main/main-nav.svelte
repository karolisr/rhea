<script lang="ts">
import TabNav from '$lib/ui/chrome/nav/components/tabnav/TabNav.svelte'
import TabSpacer from '$lib/ui/chrome/nav/components/tabnav/TabSpacer.svelte'
import Tab from '$lib/ui/chrome/nav/components/tabnav/Tab.svelte'

import iconHome from '~icons/fa6-solid/house-chimney'
import iconSettings from '~icons/fa6-solid/gear'
</script>

<TabNav uid="chrome-nav-main" navClass="nav-main">
  <TabSpacer uid="chrome-nav-main-left-spacer" minW="{68}" collapsable />
  <Tab link="/" icon="{iconHome}" label="Home" />
  <Tab link="/settings/" icon="{iconSettings}" label="Settings" />
</TabNav>
