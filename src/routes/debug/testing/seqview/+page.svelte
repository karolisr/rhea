<script lang="ts">
import { onDestroy, onMount } from 'svelte'
import type { DragOverEvent, DropEvent } from '$lib/backend'
import { appStatus } from '$lib/stores/status'
import { Alignment } from '$lib/seq/aln'
import { SeqList } from '$lib/seq/seq-list'
import type { SeqRecord } from '$lib/seq/seq-record'
import { SeqView } from '$lib/ui/seq-view'
import { processFilePaths } from '$lib/backend/file-type'
import { SeqType } from '$lib/seq'

let targetEl: HTMLElement | null = null
let filePath: string =
  '$HOME/Documents/output.bak.2/group-3/cp_loci_aa_aln/psbC.fasta'
let seqs: Alignment | SeqList

onMount(() => {
  targetEl = document.getElementById('target')
  parse([filePath])
})

onDestroy(() => {
  $appStatus.main = ''
})

async function parse(paths: string[]) {
  const info = await processFilePaths(paths)
  for (let i = 0; i < info.length; i++) {
    const x = info[i]
    if (x.contentsType in SeqType) {
      try {
        seqs = new Alignment(x.parsed as SeqRecord[])
        filePath = x.path
        $appStatus.main = filePath
      } catch (error1) {
        try {
          seqs = new SeqList(x.parsed as SeqRecord[])
          filePath = x.path
          $appStatus.main = filePath
        } catch (error2) {
          console.warn(error1, error2)
        }
      }
    }
  }
}

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

async function onDrop(e: Event) {
  const ev = e as DropEvent
  if (ev.payload !== undefined && ev.payload.type === 'files') {
    const _ = ev.payload.data as string[]
    parse(_)
  }
}
</script>

<div
  id="target"
  class="drag-target"
  on:drop="{onDrop}"
  on:dragenter="{onDragOver}"
  role="region">
</div>

<div class="seqview-container">
  {#if seqs}
    <SeqView
      uid="seqview-aln"
      {seqs} />
  {/if}
</div>

<style>
.drag-target {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.seqview-container {
  display: flex;
  overflow-y: hidden;
  flex-grow: 1;
  z-index: 1;
}
</style>
