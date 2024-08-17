<script lang="ts">
export let uid: string
export let navClass: string
</script>

<nav
  id="{uid}"
  class="{navClass} tab-nav">
  <slot />
</nav>
