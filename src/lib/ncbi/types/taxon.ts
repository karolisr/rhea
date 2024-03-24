export interface TaxaSet {
  Taxon: Taxon[]
}

export interface Taxon {
  TaxId: TaxId
  ScientificName: string
  OtherNames?: OtherNames
  ParentTaxId?: string
  Rank?: string
  Division?: string
  GeneticCode?: GeneticCode
  MitoGeneticCode?: MitoGeneticCode
  Lineage?: string
  LineageEx?: Taxon[]
  Citations?: Citation[]
  Modifiers?: Modifier[]
  Properties?: Property[]
  CreateDate?: string
  UpdateDate?: string
  PubDate?: string
  AkaTaxIds?: TaxId[]
}

type TaxId = string

export interface Name {
  ClassCDE: string
  DispName: string
  UniqueName?: string
}

export interface OtherNames {
  GenbankCommonName?: string
  GenbankAcronym?: string
  BlastName?: string
  EquivalentName: string
  Synonym: string
  Acronym: string
  Misspelling: string
  Anamorph: string
  Includes: string
  CommonName: string
  Inpart: string
  Misnomer: string
  Teleomorph: string
  GenbankSynonym: string
  GenbankAnamorph: string
  Name: Name[]
}

export interface GeneticCode {
  GCId: string
  GCName: string
}

export interface MitoGeneticCode {
  MGCId: string
  MGCName: string
}

export interface Citation {
  CitId: string
  CitKey: string
  CitUrl?: string
  CitText?: string
  CitPubmedId?: string
  CitMedlineId?: string
}

export interface Modifier {
  ModId: string
  ModType: string
  ModName: string
  ModGBhidden: string
  RModId: string
  RTaxId?: string
}

export interface Property {
  PropName: string
  PropValueInt: string
  PropValueBool: string
  PropValueString: string
}
