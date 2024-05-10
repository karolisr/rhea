<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import Radio from '$lib/ui/components/Radio.svelte'
import settings from '$lib/app/svelte-stores/settings'
import { saveSettings } from '$lib/app/svelte-stores/settings'
import { getCurentTheme } from '$lib/app/api/darkmode'

let currentOsThemeSetting: string

onMount(async () => {
  currentOsThemeSetting = await getCurentTheme()
  currentOsThemeSetting =
    currentOsThemeSetting[0].toUpperCase() + currentOsThemeSetting.slice(1)
})

onDestroy(() => {})
</script>

<div class="padded">
  <div id="settings-row">
    <div id="settings-theme" class="padded">
      <fieldset>
        <legend>Theme</legend>
        <Radio
          label="Follow OS Setting ({currentOsThemeSetting})"
          id="os"
          name="theme"
          value="os"
          bind:group="{$settings.theme}"
          on:change="{saveSettings}" />

        <Radio
          label="Light"
          id="light"
          name="theme"
          value="light"
          bind:group="{$settings.theme}"
          on:change="{saveSettings}" />

        <Radio
          label="Dark"
          id="dark"
          name="theme"
          value="dark"
          bind:group="{$settings.theme}"
          on:change="{saveSettings}" />
      </fieldset>
    </div>

    <div id="settings-scale" class="padded">
      <fieldset>
        <legend>Scale</legend>
        <Radio
          label="Small"
          id="small"
          name="scale"
          value="small"
          bind:group="{$settings.scale}"
          on:change="{saveSettings}" />

        <Radio
          label="Medium"
          id="medium"
          name="scale"
          value="medium"
          bind:group="{$settings.scale}"
          on:change="{saveSettings}" />

        <Radio
          label="Large"
          id="large"
          name="scale"
          value="large"
          bind:group="{$settings.scale}"
          on:change="{saveSettings}" />
      </fieldset>
    </div>
  </div>

  <div id="settings-ncbi-api" class="padded">
    <fieldset>
      <legend>NCBI&nbsp;API</legend>
      <div>
        <label for="email">E-Mail</label>
        <input
          type="email"
          id="email"
          placeholder="charles.darwin@something.edu"
          spellcheck="false"
          autocomplete="off"
          required
          bind:value="{$settings.email}"
          on:change="{saveSettings}" />
      </div>

      <div>
        <label for="ncbiapikey">API Key</label>
        <input
          type="text"
          id="ncbiapikey"
          placeholder=""
          spellcheck="false"
          autocomplete="off"
          required
          bind:value="{$settings.ncbi_api_key}"
          on:change="{saveSettings}" />
      </div>
    </fieldset>
  </div>
</div>
