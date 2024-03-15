<script lang="ts">
import { page } from '$app/stores'
import status from '$lib/app/svelte-stores/status'
</script>

<div class="kr-statusbar">
  <div class="bg-teal-200">{$page.url.origin}</div>
  <div class="bg-red-200">{$status.main}</div>
  <div class="bg-teal-200">{$page.url.pathname}</div>
</div>
