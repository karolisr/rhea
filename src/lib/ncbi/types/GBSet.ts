import type { IndexedUndefined } from '$lib/types'

export type GBSet = GBSeq[]

export interface GBSeq extends IndexedUndefined {
  GBSeq_accession_version: string
  GBSeq_length: number
  GBSeq_moltype: string
  GBSeq_alt_seq?: GBAltSeqData[]
  GBSeq_comment_set?: GBComment[]
  GBSeq_feature_set?: GBFeatureSet[]
  GBSeq_feature_table?: GBFeature[]
  GBSeq_keywords?: GBKeyword[]
  GBSeq_other_seqids?: GBSeqid[]
  GBSeq_references?: GBReference[]
  GBSeq_secondary_accessions?: GBSecondary_accn[]
  GBSeq_struc_comments?: GBStrucComment[]
  GBSeq_xrefs?: GBXref[]
  GBSeq_comment?: string
  GBSeq_contig?: string
  GBSeq_create_date?: string
  GBSeq_create_release?: string
  GBSeq_database_reference?: string
  GBSeq_definition?: string
  GBSeq_division?: string
  GBSeq_entry_version?: string
  GBSeq_locus?: string
  GBSeq_organism?: string
  GBSeq_primary?: string
  GBSeq_primary_accession?: string
  GBSeq_project?: string
  GBSeq_segment?: string
  GBSeq_sequence?: string
  GBSeq_source?: string
  GBSeq_source_db?: string
  GBSeq_strandedness?: string
  GBSeq_taxonomy?: string
  GBSeq_topology?: string
  GBSeq_update_date?: string
  GBSeq_update_release?: string
}

export interface GBAltSeqData {
  GBAltSeqData_name: string
  GBAltSeqData_items?: GBAltSeqItem[]
}

export interface GBAltSeqItem {
  GBAltSeqItem_interval?: GBInterval
  GBAltSeqItem_first_accn?: string
  GBAltSeqItem_gap_comment?: string
  GBAltSeqItem_gap_length?: number
  GBAltSeqItem_gap_linkage?: string
  GBAltSeqItem_gap_type?: string
  GBAltSeqItem_isgap?: boolean
  GBAltSeqItem_last_accn?: string
  GBAltSeqItem_value?: string
}

export interface GBAuthor {
  GBAuthor: string
}

export interface GBComment {
  GBComment_paragraphs: GBCommentParagraph[]
  GBComment_type?: string
}

export interface GBCommentParagraph {
  GBCommentParagraph: string
}

export interface GBFeature {
  GBFeature_key: string
  GBFeature_location: string
  GBFeature_intervals?: GBInterval[]
  GBFeature_quals?: GBQualifier[]
  GBFeature_xrefs?: GBXref[]
  GBFeature_operator?: string
  GBFeature_partial3?: boolean
  GBFeature_partial5?: boolean
}

export interface GBFeatureSet {
  GBFeatureSet_features: GBFeature[]
  GBFeatureSet_annot_source?: string
}

export interface GBInterval {
  GBInterval_accession: string
  GBInterval_from?: number
  GBInterval_interbp?: boolean
  GBInterval_iscomp?: boolean
  GBInterval_point?: number
  GBInterval_to?: number
}

export interface GBKeyword {
  GBKeyword: string
}

export interface GBQualifier {
  GBQualifier_name: string
  GBQualifier_value?: string
}

export interface GBReference {
  GBReference_journal: string
  GBReference_reference: string
  GBReference_authors?: GBAuthor[]
  GBReference_xref?: GBXref[]
  GBReference_consortium?: string
  GBReference_position?: string
  GBReference_pubmed?: number
  GBReference_remark?: string
  GBReference_title?: string
}

export interface GBSecondary_accn {
  GBSecondary_accn: string
}

export interface GBSeqid {
  GBSeqid: string
}

export interface GBStrucComment {
  GBStrucComment_items: GBStrucCommentItem[]
  GBStrucComment_name?: string
}

export interface GBStrucCommentItem {
  GBStrucCommentItem_tag?: string
  GBStrucCommentItem_url?: string
  GBStrucCommentItem_value?: string
}

export interface GBXref {
  GBXref_dbname: string
  GBXref_id: string
}
