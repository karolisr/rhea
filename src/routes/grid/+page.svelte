<script lang="ts">
import ResizableGrid from '$lib/ui/views/ResizableGrid'
</script>

<ResizableGrid nRow="{1}" nCol="{2}" rowHs="{[-1]}" colWs="{[400, -1]}">
  <div>
    <ResizableGrid nRow="{2}" nCol="{1}" rowHs="{[100, -1]}" colWs="{[-1]}">
      <div>1</div>
      <ResizableGrid
        nRow="{1}"
        nCol="{3}"
        rowHs="{[-1]}"
        colWs="{[50, 50, -1]}">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </ResizableGrid>
    </ResizableGrid>
  </div>
</ResizableGrid>

<style lang="scss">
div {
  align-content: center;
  text-align: center;
}
</style>
