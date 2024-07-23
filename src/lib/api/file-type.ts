import { readTextFile, readFile } from '@tauri-apps/plugin-fs'
import { homeDir } from '@tauri-apps/api/path'
import { parse_dtd_txt } from '$lib/xml/dtd'
import { parse_xml_txt } from '$lib/xml'
import { parseFastaStr } from '$lib/seq/fasta'

import fileTypeChecker from 'file-type-checker'
import { getPropNames } from '$lib'
import type { FileSignature } from 'file-type-checker/dist/core'

// import { insertGbSeqRecords } from './db/seqrecs'
// import type { GBSet } from '$lib/ncbi/types/GBSet'

export async function absPath(path: string): Promise<string> {
  path = path.replace('$HOME', await homeDir())
  return path
}

export async function getFileType(path: string) {
  const fbin = await readFile(await absPath(path)).catch((error) => {
    console.warn(error)
  })

  interface FileInfo {
    extension: string
    mimeType: string
    description: string
    signature: FileSignature | undefined
  }

  let info: FileInfo | undefined
  if (fbin) {
    info = fileTypeChecker.detectFile(fbin)
    if (!info) {
      let ext: string | undefined
      const g = path.match(/(?:.*\.)(?<ext>.*)$/)?.groups
      if (g) {
        ext = g['ext'].toLowerCase()
        info = {
          extension: ext,
          mimeType: '',
          description: '',
          signature: undefined
        }
        switch (ext) {
          case 'dtd':
            info.mimeType = 'text/dtd'
            break
          case 'xml':
            info.mimeType = 'text/xml'
            break
          case 'fasta':
            info.mimeType = 'text/fasta'
            break
          case 'mfa':
            info.mimeType = 'text/fasta'
            break
          default:
            break
        }
      }
    }
  }
  return info
}

const otherParser = () => {
  return async (path: string) => {
    console.info(`Default parser. Doing nothing with: ${path}`)
  }
}

const txtParser = async (f: (txt: string) => unknown) => {
  return async (path: string) => {
    const txt = await readTextFile(await absPath(path))
    return f(txt)
  }
}

export async function getFileParser(path: string) {
  const info = await getFileType(path)

  if (info) {
    switch (info.mimeType) {
      case 'text/dtd':
        return txtParser(parse_dtd_txt)
      case 'text/xml':
        return txtParser(parse_xml_txt)
      case 'text/fasta':
        return txtParser(parseFastaStr)
      default:
        break
    }
  }
  return otherParser()
}

function getContentsType(obj: object) {
  let rv: string = '?'
  let propNames: string[] = []
  try {
    if (obj instanceof Array) {
      if (obj.length > 0) {
        propNames = getPropNames(obj[0])
      }
    } else {
      propNames = getPropNames(obj)
    }
  } catch {
    const _ = 'getContentsType() failed to parse object.'
    throw new Error(_)
  }

  propNames.forEach((n) => {
    if (n === 'GBSeq_accession_version') {
      rv = 'GBSeq'
    } else if (n === 'TSeq_accver') {
      rv = 'TSeq'
    } else if (n === 'ParentTaxId') {
      rv = 'Taxon'
    }
  })
  return rv
}

export async function insertGbSeqRecordsOnFileDropTMP(paths: string[]) {
  for (let i = 0; i < paths.length; i++) {
    // const p = paths[i]
    // const parser = await getFileParser(p)
    // const parsed = await parser(p).catch((reason) => {
    //   throw new Error(reason)
    // })
    // console.log(getContentsType(parsed as object), parsed)
    // if (getContentsType(parsed as object) === 'GBSeq') {}
    // const parsed = await (await txtParser(parse_xml_txt))(p)
    // console.log('insertGbSeqRecords', (parsed as GBSet).length)
    // await insertGbSeqRecords(parsed as GBSet, $dbs, 'dbSeqRecs', 'dbSequences')
  }
}
