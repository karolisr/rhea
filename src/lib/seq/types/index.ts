import { AASeq, NTSeq, DNASeq, RNASeq } from '../seq'

export type Seq = AASeq | NTSeq | DNASeq | RNASeq
export type SeqRecordId = string

export class Organelle {}
export class Mitochondrion extends Organelle {}
export class Plastid extends Organelle {}
export class Chloroplast extends Plastid {}

export enum SeqType {
  'AA',
  'NT',
  'RNA',
  'DNA'
}
