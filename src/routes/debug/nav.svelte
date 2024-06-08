<script lang="ts">
import TabNav from '$lib/ui/chrome/nav/components/tabnav/TabNav.svelte'
import TabSpacer from '$lib/ui/chrome/nav/components/tabnav/TabSpacer.svelte'
import Tab from '$lib/ui/chrome/nav/components/tabnav/Tab.svelte'

import iconHome from '~icons/fa6-solid/house-chimney'
import iconSearch from '~icons/fa6-solid/magnifying-glass'
import iconDnD from '~icons/fa6-solid/chess'
</script>

<TabNav uid="chrome-nav-debug" navClass="nav-debug">
  <TabSpacer
    uid="chrome-nav-debug-spacer-l"
    minW="{10}"
    collapsable
    nSpacers="{2}" />
  <Tab link="/debug/" icon="{iconHome}" />
  <Tab link="/debug/testing/search/" icon="{iconSearch}" label="Search" />
  <Tab link="/debug/testing/dnd/" icon="{iconDnD}" label="Drag & Drop" />
  <TabSpacer uid="nav-debug-spacer-r" minW="{10}" collapsable nSpacers="{2}" />
</TabNav>
