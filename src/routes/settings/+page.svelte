<script lang="ts">
import settings from '$lib/app/svelte-stores/settings'
import { saveSettings } from '$lib/app/svelte-stores/settings'
</script>

<div>
  <form>
    <fieldset>
      <legend>Theme</legend>
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
    </fieldset>
  </form>
  <div>
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
  </div>
  <div>
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
  </div>
</div>
