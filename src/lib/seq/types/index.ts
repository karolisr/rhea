import { AASeq, NTSeq, DNASeq, RNASeq } from '../seq'
import type { SeqRecord } from '../seq-record'
export type Seq = AASeq | NTSeq | DNASeq | RNASeq
export type SeqRecordID = string
export type SeqRecords = {
  [seqRecordID: SeqRecordID | string]: SeqRecord
}

export class Organelle {}
export class Mitochondrion extends Organelle {}
export class Plastid extends Organelle {}
export class Chloroplast extends Plastid {}
