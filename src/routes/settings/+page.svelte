<script lang="ts">
import { onMount, onDestroy } from 'svelte'
import { Radio } from '$lib/ui/form-elements'
import {
  appSettings,
  applyAppSettings,
  saveAppSettings
} from '$lib/stores/settings'
import { getOsTheme, themeChangeListener } from '$lib/backend/dark-mode'
import { gSysInfo } from '$lib/backend/system-info'
import type { Unlistener } from '$lib/types'

applyAppSettings()

let unlisteners: Unlistener[] = []
let currentOsThemeSetting: string

async function getCurrentOsThemeSetting() {
  currentOsThemeSetting = await getOsTheme()
  currentOsThemeSetting =
    currentOsThemeSetting[0].toUpperCase() + currentOsThemeSetting.slice(1)
}

function saveSettings() {
  applyAppSettings()
  saveAppSettings()
}

onMount(async () => {
  await getCurrentOsThemeSetting()
  unlisteners.push(await themeChangeListener(getCurrentOsThemeSetting))
})

onDestroy(() => {
  unlisteners.forEach((f) => {
    f()
  })
})
</script>

<div class="settings-container padded">
  <div id="settings-row">
    <div
      id="settings-theme"
      class="padded">
      <fieldset>
        <legend>Theme</legend>
        {#if gSysInfo.browser === 'Tauri'}
          <Radio
            label="Follow OS Setting ({currentOsThemeSetting})"
            id="os"
            name="theme"
            value="os"
            bind:group="{$appSettings.theme}"
            on:change="{saveSettings}" />
        {/if}
        <Radio
          label="Light"
          id="light"
          name="theme"
          value="light"
          bind:group="{$appSettings.theme}"
          on:change="{saveSettings}" />

        <Radio
          label="Dark"
          id="dark"
          name="theme"
          value="dark"
          bind:group="{$appSettings.theme}"
          on:change="{saveSettings}" />
      </fieldset>
    </div>

    <div
      id="settings-scale"
      class="padded">
      <fieldset>
        <legend>Scale</legend>
        <Radio
          label="Small"
          id="small"
          name="scale"
          value="small"
          bind:group="{$appSettings.scale}"
          on:change="{saveSettings}" />

        <Radio
          label="Medium"
          id="medium"
          name="scale"
          value="medium"
          bind:group="{$appSettings.scale}"
          on:change="{saveSettings}" />

        <Radio
          label="Large"
          id="large"
          name="scale"
          value="large"
          bind:group="{$appSettings.scale}"
          on:change="{saveSettings}" />
      </fieldset>
    </div>
  </div>

  <div
    id="settings-ncbi-api"
    class="padded">
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
          bind:value="{$appSettings.email}"
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
          bind:value="{$appSettings.ncbi_api_key}"
          on:change="{saveSettings}" />
      </div>
    </fieldset>
  </div>
</div>

<style>
.settings-container {
  overflow-y: scroll;
}
</style>
