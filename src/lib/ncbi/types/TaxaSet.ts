import type { IndexedUndefined } from '$lib/types'

export type TaxaSet = Taxon[]
export type TaxId = number

export interface Taxon extends IndexedUndefined {
  AkaTaxIds?: TaxId[]
  Citations?: Citation[]
  CreateDate?: string
  Division?: string
  GeneticCode?: GeneticCode
  Lineage?: string
  LineageEx?: Taxon[]
  MitoGeneticCode?: MitoGeneticCode
  Modifiers?: Modifier[]
  OtherNames?: OtherNames[]
  ParentTaxId?: TaxId
  Properties?: Property[]
  PubDate?: string
  Rank?: string
  ScientificName: string
  TaxId: TaxId
  UpdateDate?: string
}

export interface Citation {
  CitId: string
  CitKey: string
  CitMedlineId?: string
  CitPubmedId?: string
  CitText?: string
  CitUrl?: string
}

export interface GeneticCode {
  GCId: string
  GCName: string
}

export interface MitoGeneticCode {
  MGCId: string
  MGCName: string
}

export interface Modifier {
  ModGBhidden: string
  ModId: string
  ModName: string
  ModType: string
  RModId: string
  RTaxId?: TaxId
}

export interface Name {
  ClassCDE: string
  DispName: string
  UniqueName?: string
}

export interface NameExtra {
  Acronym?: string
  Anamorph?: string
  BlastName?: string
  CommonName?: string
  EquivalentName?: string
  GenbankAcronym?: string
  GenbankAnamorph?: string
  GenbankCommonName?: string
  GenbankSynonym?: string
  Includes?: string
  Inpart?: string
  Misnomer?: string
  Misspelling?: string
  Synonym?: string
  Teleomorph?: string
}

export type OtherNames = Name | NameExtra

export interface Property {
  PropName: string
  PropValueBool: string
  PropValueInt: string
  PropValueString: string
}
