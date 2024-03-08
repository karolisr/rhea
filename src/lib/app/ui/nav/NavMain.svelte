<script lang="ts">
import TabNav from './components/tabnav/TabNav.svelte'
import Tab from './components/tabnav/Tab.svelte'
import TabSpacer from './components/tabnav/TabSpacer.svelte'

import iconHome from '~icons/fa6-solid/house-chimney'
import iconSearch from '~icons/fa6-solid/magnifying-glass'
import iconDebug from '~icons/fa6-solid/bug'
import iconSettings from '~icons/fa6-solid/gear'
</script>

<TabNav>
  <Tab link="/" icon="{iconHome}" />
  <Tab link="/search" icon="{iconSearch}" />
  <TabSpacer />
  <Tab link="/debug" icon="{iconDebug}" />
  <Tab link="/settings" icon="{iconSettings}" />
</TabNav>
