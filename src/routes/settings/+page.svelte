<script lang="ts">
import settings from '$lib/app/svelte-stores/settings'
import { saveSettings } from '$lib/app/svelte-stores/settings'
</script>

<div>
  <fieldset>
    <legend>Theme</legend>

    <div>
      <div>
        <input
          type="radio"
          id="os"
          name="theme"
          value="os"
          bind:group="{$settings.theme}"
          on:change="{saveSettings}" />
        <label for="os">Follow OS Setting</label>
      </div>
    </div>

    <div>
      <div>
        <input
          type="radio"
          id="light"
          name="theme"
          value="light"
          bind:group="{$settings.theme}"
          on:change="{saveSettings}" />
        <label for="light">Light</label>
      </div>
    </div>

    <div>
      <div>
        <input
          type="radio"
          id="dark"
          name="theme"
          value="dark"
          bind:group="{$settings.theme}"
          on:change="{saveSettings}" />
        <label for="dark">Dark</label>
      </div>
    </div>
  </fieldset>

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
