<script lang="ts">
import settings from '$lib/app/svelte-stores/settings'
import { saveSettings } from '$lib/app/svelte-stores/settings'
</script>

<label for="email">Email address</label>
<input
  type="email"
  id="email"
  placeholder="charles.darwin@something.edu"
  spellcheck="false"
  autocomplete="off"
  required
  bind:value="{$settings.email}"
  on:change="{saveSettings}" />

<label for="ncbiapikey">NCBI API Key</label>
<input
  type="text"
  id="ncbiapikey"
  placeholder=""
  spellcheck="false"
  autocomplete="off"
  required
  bind:value="{$settings.ncbi_api_key}"
  on:change="{saveSettings}" />
