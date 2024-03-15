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
      <slot name="hd">HEADER PLACEHOLDER: element Header</slot>
      <slot name="subhd">SUBHEADER PLACEHOLDER: element Header</slot>
    </Header>
  {/if}

  {#if mn}
    <Main>
      <slot name="mn">MAIN PLACEHOLDER: element Header</slot>
    </Main>
  {/if}

  {#if ft}
    <Footer>
      <slot name="ft">FOOTER PLACEHOLDER: element Header</slot>
    </Footer>
  {/if}
</div>
