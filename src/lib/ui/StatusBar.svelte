<script lang="ts">
import { page } from '$app/stores'
import { appStatus } from '$lib/stores/status'
</script>

<div
  id="chrome-status-bar"
  data-tauri-drag-region
  class="status-bar">
  <div
    id="chrome-status-bar-left"
    data-tauri-drag-region
    class="status-bar-left">
    {$page.url.origin}
  </div>
  <div
    id="chrome-status-bar-center"
    data-tauri-drag-region
    class="status-bar-center">
    {$appStatus.main}
  </div>
  <div
    id="chrome-status-bar-right"
    data-tauri-drag-region
    class="status-bar-right">
    {$page.url.pathname}
  </div>
</div>
