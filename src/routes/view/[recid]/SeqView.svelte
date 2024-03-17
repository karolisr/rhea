<script lang="ts">
const nums: number[] = []
const m = 10

for (let i = 1; i < m; i++) {
  nums.push((i / m) * 100)
}
</script>

<div class="border-0 border-solid border-neutral-950">
  <svg viewBox="0 0 640 640" preserveAspectRatio="none">
    <g class="bg">
      <rect x="0%" y="0%" width="100%" height="100%"></rect>
      {#each nums as i}
        <line x1="0%" y1="{i}%" x2="100%" y2="{i}%"></line>
        <line x1="{i}%" y1="0%" x2="{i}%" y2="100%"></line>
      {/each}
    </g>
    <g transform="translate(0, 0)">
      <polyline points="0 0, 480 0, 640 320, 480 640, 0 640, 0 0"></polyline>
      <!-- <g transform="translate(375, 500)">
        <text font-weight="bold">Feature</text>
      </g> -->
    </g>
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
  background-color: transparent;
  stroke: black;
  fill: floralwhite;
  /* stroke-width: 1px; */
}

svg g {
  align-items: center;
  text-align: center;
}

svg text {
  font-family: 'Courier New', Courier, monospace;
  stroke: transparent;
  stroke-width: 0px;
  fill: black;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: 100px;
}

svg .bg {
  stroke: #a3a3a3;
  fill: cornsilk;
}
</style>
