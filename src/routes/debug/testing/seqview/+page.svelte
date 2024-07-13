<script lang="ts">
import SeqView from '$lib/ui/views/SeqView'
import { SeqRecord } from '$lib/seq/seq-record'
import { DNASeq } from '$lib/seq/seq'
import { onMount } from 'svelte'
import { Alignment } from '$lib/seq/aln'

const sq1 = new DNASeq('AC-T----GTGA', 1)
const sq2 = new DNASeq('ACGT--AC-TGA', 1)
const sq3 = new DNASeq('ACGTGTACGTGA', 1)

const sr1 = new SeqRecord('sr_1', sq1)
const sr2 = new SeqRecord('sr_2', sq2)
const sr3 = new SeqRecord('sr_3', sq3)

let seqRecords: SeqRecord[] = []

onMount(() => {
  seqRecords = [sr1, sr2, sr3]
})
</script>

<SeqView uid="sv1" seqs={new Alignment(seqRecords)} />
