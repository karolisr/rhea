<script lang="ts">
import TabNav from '$lib/ui/chrome/nav/components/tabnav/TabNav.svelte'
import TabSpacer from '$lib/ui/chrome/nav/components/tabnav/TabSpacer.svelte'
import Tab from '$lib/ui/chrome/nav/components/tabnav/Tab.svelte'

import iconHome from '~icons/fa6-solid/house-chimney'
import iconColl from '~icons/fa6-solid/database'
import iconSearch from '~icons/fa6-solid/magnifying-glass'
import iconTables from '~icons/fa6-solid/table-cells'
import iconImages from '~icons/fa6-solid/image'
</script>

<TabNav uid="chrome-nav-debug" navClass="nav-debug">
  <TabSpacer uid="chrome-nav-debug-spacer-l" minW="{10}" />
  <Tab link="/debug/" icon="{iconHome}" />

  <Tab
    link="/debug/testing/taxsqliteimg/"
    icon="{iconImages}"
    label="Taxonomy Images" />

  <Tab
    link="/debug/testing/taxsqlite/"
    icon="{iconColl}"
    label="Taxonomy SQLite" />
  <!-- <Tab link="/debug/testing/coll/" icon="{iconColl}" label="Collections" /> -->
  <!-- <Tab link="/debug/testing/tables/" icon="{iconTables}" label="Tables" /> -->
  <Tab link="/debug/testing/search/" icon="{iconSearch}" label="Search" />
  <TabSpacer uid="nav-debug-spacer-r" minW="{10}" collapsable nSpacers="{2}" />
</TabNav>
