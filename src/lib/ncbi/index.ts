import type { IndexedUndefined } from '$lib/types'

export enum EntrezFiltersOrganelles {
  plastid = 'plastid',
  chloroplast = 'chloroplast',
  mitochondrion = 'mitochondrion'
}

export enum EntrezPropertiesBiomol {
  DNA = 'biomol_genomic',
  RNA = 'biomol_rna',
  mRNA = 'biomol_mrna',
  rRNA = 'biomol_rrna',
  tRNA = 'biomol_trna'
}

export enum NCBIDatabase {
  // ToDo: incomplete
  nuccore = 'nuccore',
  protein = 'protein',
  taxonomy = 'taxonomy'
}

export enum Eutil {
  // ToDo: incomplete
  efetch = 'efetch.fcgi',
  einfo = 'einfo.fcgi',
  elink = 'elink.fcgi',
  epost = 'epost.fcgi',
  esearch = 'esearch.fcgi',
  espell = 'espell.fcgi',
  esummary = 'esummary.fcgi'
}

export enum RetMode {
  // ToDo: incomplete
  json = 'json',
  xml = 'xml',
  text = 'text'
}

export enum IdType {
  // ToDo: incomplete
  acc = 'acc'
}

export enum RetTypeEFetch {
  // ToDo: incomplete
  acc = 'acc',
  fasta = 'fasta',
  gb = 'gb',
  gp = 'gp'
}

export enum RetTypeESearch {
  // ToDo: incomplete
  uilist = 'uilist',
  count = 'count'
}

export enum RetContentType {
  // ToDo: incomplete
  json,
  xml,
  text
}

export interface ESummaryJSON {
  header: {
    type: string
    version: string
  }
  esummaryresult?: string[]
  result: {
    [uid: string]: object
    uids: string[]
  }
}

export interface ESummary extends IndexedUndefined {
  uid: string
}

export interface ESummaryTaxonomy extends ESummary {
  status: string
  rank: string
  division: string
  scientificname: string
  commonname: string
  taxid: number
  akataxid: number | string
  genus: string
  species: string
  subsp: string
  modificationdate: string
  genbankdivision: string
}

export interface ESummaryNuccore extends ESummary {
  accessionversion: string
  title: string
  createdate: string
  updatedate: string
  taxid: number
  organism: string
  slen: number
  biomol: string
  moltype: string
  topology: string
  sourcedb: string
  genome: string
  completeness: string
  geneticcode: string
  strand: string
  subtype: string
  subname: string
  assemblyacc: string
  assemblygi: string
  biosample: string
  caption: string
  extra: string
  flags: number
  gi: number
  projectid: string
  segsetsize: string
  strain: string
  tech: string
  term: string
  statistics: {
    type: string
    count: number
    subtype?: string
    source?: string
  }[]
}

export interface History {
  count: string
  retmax: string
  retstart: string
  querykey: string
  webenv: string
}
