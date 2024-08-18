<script lang="ts">
import TabNav from '$lib/ui/tab-nav/TabNav.svelte'
import TabSpacer from '$lib/ui/tab-nav/TabSpacer.svelte'
import Tab from '$lib/ui/tab-nav/Tab.svelte'

import iconHome from '~icons/fa6-solid/house-chimney'
import iconTableView from '~icons/fa6-solid/table'
import iconSeqView from '~icons/fa6-solid/dna'
import iconDnD from '~icons/fa6-solid/chess'
import iconSearch from '~icons/fa6-solid/magnifying-glass'
</script>

<TabNav
  uid="chrome-nav-debug"
  navClass="nav-debug">
  <TabSpacer
    uid="chrome-nav-debug-spacer-l"
    minW="{10}"
    collapsable
    nSpacers="{2}" />
  <Tab
    link="/debug/"
    icon="{iconHome}" />
  <Tab
    link="/debug/testing/tableview/"
    icon="{iconTableView}"
    label="TableView" />
  <Tab
    link="/debug/testing/seqview/"
    icon="{iconSeqView}"
    label="SeqView" />
  <Tab
    link="/debug/testing/search/"
    icon="{iconSearch}"
    label="Search" />
  <Tab
    link="/debug/testing/dnd/"
    icon="{iconDnD}"
    label="Drag & Drop" />
  <TabSpacer
    uid="nav-debug-spacer-r"
    minW="{10}"
    collapsable
    nSpacers="{2}" />
</TabNav>
