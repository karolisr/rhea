<script lang="ts">
import Header from './Header.svelte'
import Main from './Main.svelte'
import Footer from './Footer.svelte'

export let hd = false
export let mn = false
export let ft = false
</script>

<div class="kr-container">
  {#if hd}
    <Header>
      <slot name="hd">HEADER PLACEHOLDER</slot>
    </Header>
  {/if}

  {#if mn}
    <Main>
      <slot name="mn">MAIN PLACEHOLDER</slot>
    </Main>
  {/if}

  {#if ft}
    <Footer>
      <slot name="ft">FOOTER PLACEHOLDER</slot>
    </Footer>
  {/if}
</div>
