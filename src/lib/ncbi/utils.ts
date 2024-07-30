import { EutilParams } from './eutils-params'
import { RetMode, RetTypeEFetch, NCBIDatabase } from '.'
import { esearch, efetch } from './eutils'
import type { GBSet, GBSeq } from './types/GBSet'
import { EntrezFiltersOrganelles, EntrezPropertiesBiomol } from '.'

export async function getTaxIds(term: string): Promise<number[]> {
  if (term.trim() !== '') {
    const response = await esearch(NCBIDatabase.taxonomy, term, false)
    const data = response.data as {
      esearchresult: {
        idlist: string[]
      }
    }
    const taxids = data.esearchresult.idlist.map((tid) => Number(tid))
    return taxids
  } else {
    return []
  }
}

export function makeESearchTerm(
  taxids: number[] = [],
  filters: (keyof typeof EntrezFiltersOrganelles)[] = [],
  refSeq: boolean = false,
  props: (keyof typeof EntrezPropertiesBiomol)[] = [],
  lenMin: number = 1e4,
  lenMax: number = 1e7
): string {
  lenMin = Math.max(lenMin, 0)
  lenMax = Math.min(lenMax, 1e10)

  const _filters = filters.map((k) => EntrezFiltersOrganelles[k])
  const _props = props.map((k) => EntrezPropertiesBiomol[k])

  const taxn_term: string =
    '(txid' + taxids.join('[PORGN] OR txid') + '[PORGN])'
  const filt_term: string = '(' + _filters.join('[filter] OR ') + '[filter])'
  const slen_term: string = `${lenMin}[SLEN] : ${lenMax}[SLEN]`
  const props_term: string = '(' + _props.join('[PROP] OR ') + '[PROP])'
  const refs_term = 'refseq[filter]'

  const terms: string[] = []

  if (taxids.length > 0) {
    terms.push(taxn_term)
  }

  if (filters.length > 0) {
    terms.push(filt_term)
  }

  terms.push(slen_term)

  if (props.length > 0) {
    terms.push(props_term)
  }

  if (refSeq) {
    terms.push(refs_term)
  }

  const term = terms.join(' AND ')
  // console.log(term)
  return term
}

export async function getSeqRecords(
  db: keyof typeof NCBIDatabase,
  accs: string[]
): Promise<GBSet> {
  const p = new EutilParams()
  p.db = db
  p.ids = accs
  p.retmode = RetMode.xml
  p.rettype = RetTypeEFetch.gb
  const rv: GBSet = []
  if (accs.length > 0) {
    const efetch_result = (await efetch(p)) as GBSet[]
    efetch_result.forEach((gbset) => {
      gbset.forEach((gbseq) => {
        rv.push(gbseq)
      })
    })
  }
  return rv
}

export function getTaxId(gbseq: GBSeq): number | undefined {
  let taxid: number | undefined
  const ft = gbseq.GBSeq_feature_table
  if (ft && ft.length > 0) {
    if (ft[0].GBFeature_key === 'source') {
      const qualifiers = ft[0].GBFeature_quals
      if (qualifiers) {
        qualifiers.forEach((q) => {
          if (q.GBQualifier_name === 'db_xref') {
            if (
              q.GBQualifier_value &&
              q.GBQualifier_value.startsWith('taxon')
            ) {
              taxid = Number(q.GBQualifier_value.split('taxon:')[1])
            }
          }
        })
      }
    }
  }
  return taxid
}
