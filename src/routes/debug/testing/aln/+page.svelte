<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import type { DragOverEvent, DropEvent } from '$lib/app/api/types'
import status from '$lib/app/svelte-stores/status'
import { getFileParser } from '$lib/app/api/file-type'
import { Alignment } from '$lib/seq/aln'
import type { SeqRecord } from '$lib/seq/seq-record'
import SeqView from '$lib/ui/views/SeqView'

let targetEl: HTMLElement | null = null
let filePath: string =
  '$HOME/Documents/output.bak.2/group-3/cp_loci_nt_aln/ycf2.fasta'
let parser: (txt: string) => Promise<unknown>
let seqRecs: SeqRecord[] = []
let aln: Alignment = new Alignment([])

onMount(() => {
  targetEl = document.getElementById('target')
})

onDestroy(() => {
  $status.main = ''
})

async function fileParser(path: string) {
  parser = await getFileParser(path)
}

async function parse(path: string) {
  seqRecs = (await parser(path)) as SeqRecord[]
  aln = new Alignment(seqRecs)
}

$: $status.main = filePath
$: if (targetEl && filePath) fileParser(filePath)
$: if (parser !== undefined && filePath) parse(filePath)
// $: if (targetEl && filePath) console.log(filePath)
// $: if (aln) console.log(aln)

function onDragOver(e: Event) {
  const ev = e as DragOverEvent
  if (ev.payload !== undefined) {
    if (ev.payload.type !== 'files') {
      ev.payload.targetCanAccept = false
    } else {
      ev.payload.targetCanAccept = true
    }
  }
}

function onDrop(e: Event) {
  const ev = e as DropEvent
  if (ev.payload !== undefined && ev.payload.type === 'files') {
    const _ = ev.payload.data as string[]
    filePath = _[0]
  }
}
</script>

<div
  id="target"
  class="drag-target"
  on:drop="{onDrop}"
  on:dragenter="{onDragOver}"
  role="region">
  <div class="seqview-container">
    <SeqView uid="seqview-aln" seqs="{aln}" />
  </div>
</div>

<style>
.drag-target {
  background-color: aliceblue;
  padding: 25px;
  margin: 25px;
  border-style: solid;
}

.seqview-container {
  display: flex;
  align-content: unset;
  text-align: unset;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: white;
}
</style>
