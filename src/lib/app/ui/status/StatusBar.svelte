<script lang="ts">
import { page } from '$app/stores'
$: path = $page.url.pathname.replace('/', '')
</script>

<div class="kr-statusbar">
  <div class="bg-teal-200">column 1</div>
  <div class="bg-red-200">{path}</div>
  <div class="bg-teal-200">column 3</div>
</div>
