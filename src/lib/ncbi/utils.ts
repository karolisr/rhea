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
