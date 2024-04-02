<script lang="ts">
import { page } from '$app/stores'
import status from '$lib/app/svelte-stores/status'
</script>

<div data-tauri-drag-region class="status-bar">
  <div data-tauri-drag-region class="status-bar-left">
    {$page.url.origin}
  </div>
  <div data-tauri-drag-region class="status-bar-center">
    {$status.main}
  </div>
  <div data-tauri-drag-region class="status-bar-right">
    {$page.url.pathname}
  </div>
</div>
