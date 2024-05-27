<script lang="ts">
import { onDestroy, onMount } from 'svelte'
// let elementUnderMouse: EventTarget | null
// $: console.log(elementUnderMouse)
// function mouseOverEventListener(e: MouseEvent) {
//   elementUnderMouse = e.target
// }

onMount(() => {
  // addEventListener('mouseover', mouseOverEventListener)
})
onDestroy(() => {
  // removeEventListener('mouseover', mouseOverEventListener)
})
</script>

<div id="container" class="container">
  <div id="source">
    <div id="item1" class="item">Item 1</div>
    <div id="item2" class="item">Item 2</div>
    <div id="item3" class="item">Item 3</div>
    <div id="item4" class="item">Item 4</div>
  </div>
  <div id="target"></div>
</div>

<style>
.container {
  cursor: default;
  display: flex;
  flex-direction: row;
  margin: auto;
  gap: 20px;
}

#target {
  cursor: default;
  margin: auto;
  width: 200px;
  height: 100px;
  padding: 20px;
  border-style: solid;
  background-color: antiquewhite;
}

.item {
  cursor: grab;
  padding: 10px;
  background-color: aliceblue;
  border-style: solid;
  width: 100px;
}

#source {
  cursor: default;
  border-style: solid;
  /* padding-block-start: 5px;
  padding-block-end: 5px;
  padding-inline-start: 5px; */
}

#source:hover {
  /* padding-block-start: 0px;
  padding-block-end: 0px; */
}

.item:hover {
  cursor: grab;
  background-color: azure;
  /* margin-inline-start: 5px;
  margin-inline-end: 5px;
  margin-block-start: 5px;
  margin-block-end: 5px; */
}

.item:active {
  cursor: grabbing;
  background-color: lavenderblush;
}
</style>
