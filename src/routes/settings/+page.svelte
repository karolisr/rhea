<script lang="ts">
import { Input, Label } from 'flowbite-svelte'

import settings from '$lib/app/svelte-stores/settings'
import { saveSettings } from '$lib/app/svelte-stores/settings'

function save(): void {
  saveSettings()
}
</script>

<div class="grid gap-6 p-5 md:grid-cols-1">
  <div class="">
    <Label for="email" class="mb-2">Email address</Label>
    <Input
      type="email"
      id="email"
      placeholder="charles.darwin@something.edu"
      spellcheck="false"
      autocomplete="off"
      required
      class="block w-full cursor-text select-text disabled:opacity-50 rtl:text-right"
      bind:value="{$settings.email}"
      on:change="{save}" />
  </div>

  <div>
    <Label for="ncbiapikey" class="mb-2">NCBI API Key</Label>
    <Input
      type="text"
      id="ncbiapikey"
      placeholder=""
      spellcheck="false"
      autocomplete="off"
      required
      class="block w-full cursor-text select-text disabled:opacity-50 rtl:text-right"
      bind:value="{$settings.ncbi_api_key}"
      on:change="{save}" />
  </div>
</div>
