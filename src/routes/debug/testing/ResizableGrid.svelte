<script lang="ts">
let nRow = 12
let nCol = 12

let grid: {
  col: { start: number; end: number }
  row: { start: number; end: number }
  val: string
}[] = []

grid.push({
  col: { start: 1, end: nCol + 1 },
  row: { start: 1, end: 2 },
  val: 'HEADER'
})

grid.push({
  col: { start: 1, end: nCol / 3 + 1 },
  row: { start: 2, end: nRow / 3 + 1 },
  val: 'SIDEBAR 1'
})

grid.push({
  col: { start: 1, end: nCol / 3 + 1 },
  row: { start: nRow / 3 + 1, end: nRow / 3 + nRow / 3 },
  val: 'SIDEBAR 2'
})

grid.push({
  col: { start: 1, end: nCol / 3 + 1 },
  row: { start: nRow / 3 + nRow / 3, end: nRow },
  val: 'SIDEBAR 3'
})

grid.push({
  col: { start: nCol / 3 + 1, end: nCol + 1 },
  row: { start: 2, end: nRow / 2 + 1 },
  val: 'CONTENT 1'
})

grid.push({
  col: { start: nCol / 3 + 1, end: nCol + 1 },
  row: { start: nRow / 2 + 1, end: nRow },
  val: 'CONTENT 2'
})

grid.push({
  col: { start: 1, end: nCol + 1 },
  row: { start: nRow, end: nRow + 1 },
  val: 'FOOTER'
})
</script>

<div class="resizable-grid" style:--nRow="{nRow}" style:--nCol="{nCol}">
  {#each grid as cell}
    <div
      style:grid-column-start="{cell.col.start}"
      style:grid-column-end="{cell.col.end}"
      style:grid-row-start="{cell.row.start}"
      style:grid-row-end="{cell.row.end}">
      {cell.val}
    </div>
  {/each}
</div>

<style>
.resizable-grid {
  flex-grow: 1;
  display: grid;
  gap: 1px;
  margin: 1px;
  grid-template-rows: repeat(var(--nRow), 1fr);
  grid-template-columns: repeat(var(--nCol), 1fr);
}

.resizable-grid div {
  border-style: solid;
  align-content: center;
  text-align: center;
}
</style>
