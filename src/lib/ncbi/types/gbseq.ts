import type { Indexed } from '$lib/types'

export interface GBSet {
  GBSeq: GBSeq[]
}

export interface GBSeq extends Indexed {
  GBSeq_locus: string
  GBSeq_length: number
  GBSeq_strandedness: string
  GBSeq_moltype: string
  GBSeq_topology: string
  GBSeq_division: string
  GBSeq_update_date: string
  GBSeq_create_date: string
  GBSeq_definition: string
  GBSeq_primary_accession: string
  GBSeq_accession_version: string
  GBSeq_other_seqids: GBSeqOtherSeqIDs
  GBSeq_project: string
  GBSeq_keywords: GBSeqKeywords
  GBSeq_source: string
  GBSeq_organism: string
  GBSeq_taxonomy: string
  GBSeq_references: GBSeqReferences
  GBSeq_comment: string
  GBSeq_feature_table: GBSeqFeatureTable
  GBSeq_sequence: string
  GBSeq_xrefs: GBXrefs
}

export interface GBSeqFeatureTable {
  GBFeature: GBFeature[]
}

export interface GBFeatureIntervals {
  GBInterval: GBInterval[]
}

export interface GBFeatureQuals {
  GBQualifier: GBQualifier[]
}

export interface GBQualifier {
  GBQualifier_name: string
  GBQualifier_value?: string
}

export interface GBInterval {
  GBInterval_from: number
  GBInterval_to: number
  GBInterval_accession: string
  GBInterval_iscomp?: boolean
}

export interface GBFeature {
  GBFeature_key: string
  GBFeature_location: string
  GBFeature_intervals: GBFeatureIntervals
  GBFeature_quals: GBFeatureQuals
  GBFeature_operator?: string
  GBFeature_partial5?: boolean
  GBFeature_partial3?: boolean
}

export interface GBSeqKeywords {
  GBKeyword: GBKeyword[]
}

export interface GBKeyword {
  GBKeyword: string
}

export interface GBSeqOtherSeqIDs {
  GBSeqid: GBSeqid[]
}

export interface GBSeqid {
  GBSeqid: string
}

export interface GBSeqReferences {
  GBReference: GBReference[]
}

export interface GBReference {
  GBReference_reference: string
  GBReference_position: string
  GBReference_authors?: GBReferenceAuthors
  GBReference_title: string
  GBReference_journal: string
  GBReference_xref?: GBXrefs
  GBReference_pubmed?: number
  GBReference_consortium?: string
  GBReference_remark?: string
}

export interface GBReferenceAuthors {
  GBAuthor: GBAuthor[]
}

export interface GBAuthor {
  GBAuthor: string
}

export interface GBXrefs {
  GBXref: GBXref[]
}

export interface GBXref {
  GBXref_dbname: string
  GBXref_id: string
}
