import { EutilParams } from './eutils-params'
import { RetMode, RetTypeEFetch, NCBIDatabase } from '.'
import { esearch, efetch } from './eutils'

export async function getTaxIDs(term: string): Promise<number[]> {
  if (term.trim() !== '') {
    const response = await esearch(NCBIDatabase.taxonomy, term, false)
    const data = response.data as { esearchresult: { idlist: string[] } }
    const taxids = data.esearchresult.idlist.map((tid) => Number(tid))
    return taxids
  } else {
    return []
  }
}

export function makeESearchTerm(
  taxids: number[],
  filters: string[],
  only_ref_seq: boolean = false,
  len_min: number = 1e4,
  len_max: number = 1e7
): string {
  len_min = Math.max(len_min, 0)
  len_max = Math.min(len_max, 1e10)

  const taxn_term: string =
    '(txid' + taxids.join('[PORGN] OR txid') + '[PORGN])'
  const filter_term: string = '(' + filters.join('[filter] OR ') + '[filter])'
  const slen_term: string = `${len_min}[SLEN] : ${len_max}[SLEN]`
  const bmol_term = 'biomol_genomic[PROP]'
  const refs_term = 'refseq[filter]'

  const terms: string[] = [taxn_term, filter_term, slen_term, bmol_term]

  if (only_ref_seq) {
    terms.push(refs_term)
  }

  return terms.join(' AND ')
}

export async function getSeqRecords(
  db: keyof typeof NCBIDatabase,
  accs: string[]
): Promise<object | string> {
  const p = new EutilParams()
  p.db = db
  p.ids = accs
  p.retmode = RetMode.xml
  p.rettype = RetTypeEFetch.gb
  // const return_value: object[] = []
  let returnValue = ''
  if (accs.length > 0) {
    // const efetch_result = (await efetch(p)) as object[]
    // efetch_result.forEach(...)
    const efetchResult = (await efetch(p)) as string
    returnValue = efetchResult
  }
  return returnValue
}
