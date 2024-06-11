<script lang="ts">
export let seq: string | undefined = undefined
export let seqType: string | undefined = undefined
</script>

<div>{seqType}</div>
<div>{seq}</div>

<!--
<div class="seqview-container">
  <div class="seqview-seq">
    {seq}
  </div>
</div>
-->

<style>
/*
.seqview-container {
  display: flex;
  flex-direction: column;
  background-color: azure;
  overflow-x: scroll;
}
.seqview-seq {
  flex-grow: 0;
  background-color: beige;
  font-family: 'JetBrains Mono';
  overflow-x: scroll;
}
*/
</style>
