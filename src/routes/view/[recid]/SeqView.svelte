<script lang="ts">
const nums: number[] = []
const m = 32

for (let i = 1; i < m; i++) {
  nums.push((i / m) * 100)
}
</script>

<div class="border-0 border-solid border-neutral-950">
  <svg class="">
    {#each nums as i}
      <g class="stroke-neutral-400">
        <line x1="0%" x2="100%" y1="{i}%" y2="{i}%"></line>
        <line y1="0%" y2="100%" x1="{i}%" x2="{i}%"></line>
      </g>
    {/each}
  </svg>
</div>

<style>
div {
  box-sizing: content-box;
  margin: auto;
  padding: 0px;
}

svg {
  box-sizing: content-box;
  padding: 0px;
  margin: 0px;
  width: 640px;
  height: 640px;
  /* background-color: lemonchiffon; */
  background-color: cornsilk;
  stroke: black;
  stroke-width: 1px;
  /* stroke-linecap: round; */
  /* stroke-linejoin: round; */
}
</style>
