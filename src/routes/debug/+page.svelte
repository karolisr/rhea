<script lang="ts">
import { onDestroy, onMount } from 'svelte'
onMount(() => {})
onDestroy(() => {})
</script>

<div id="container" class="container">
  <div id="source">
    <div id="item1" class="item draggable">Item 1</div>
    <div id="item2" class="item draggable">Item 2</div>
    <div id="item3" class="item draggable">Item 3</div>
    <div id="item4" class="item draggable">Item 4</div>
  </div>
  <div id="target" class="drag-target"></div>
</div>

<style>
.container {
  display: flex;
  flex-direction: row;
  margin: auto;
  gap: 20px;
  transition: all 1000ms ease;
}

#target {
  margin: auto;
  width: 200px;
  height: 100px;
  padding: 20px;
  border-style: solid;
  background-color: antiquewhite;
}

.item {
  padding: 10px;
  background-color: aliceblue;
  border-style: solid;
  width: 100px;
}

#source {
  border-style: solid;
}

.item:hover {
  background-color: azure;
}

.item:active {
  background-color: lavenderblush;
}
</style>
