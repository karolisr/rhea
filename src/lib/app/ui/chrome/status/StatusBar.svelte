<script lang="ts">
import { page } from '$app/stores'
import status from '$lib/app/svelte-stores/status'
</script>

<div class="status-bar">
  <div>{$page.url.origin}</div>
  <div>{$status.main}</div>
  <div>{$page.url.pathname}</div>
</div>
