import { readTextFile, readFile } from '@tauri-apps/plugin-fs'
import { homeDir } from '@tauri-apps/api/path'
import { parseDtdText } from '$lib/xml/dtd'
import { parseXmlText } from '$lib/xml'
import { parseFastaStr } from '$lib/seq/fasta'

import fileTypeChecker from 'file-type-checker'
import { getPropNames } from '$lib/utils'
import type { FileSignature } from 'file-type-checker/dist/core'
import { SeqRecord } from '$lib/seq/seq-record'

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
          case 'txt':
            info.mimeType = 'text/plain'
            break
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
            info.mimeType = '?'
            break
        }
      }
    }
  }
  return info
}

const otherParser = () => {
  return async (path: string) => {
    // console.info(`Default parser. Doing nothing with: ${path}`)
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
      case 'text/plain':
        return txtParser((txt: string) => txt)
      case 'text/dtd':
        return txtParser(parseDtdText)
      case 'text/xml':
        return txtParser(parseXmlText)
      case 'text/fasta':
        return txtParser(parseFastaStr)
      default:
        break
    }
  }
  return otherParser()
}

function getContentsType(obj: unknown) {
  let rv: string = '?'
  let propNames: string[] = []
  try {
    if (obj instanceof Array) {
      if (obj.length > 0) {
        obj = obj[0]
        propNames = getPropNames(obj)
        if (propNames.includes('_id') && propNames.includes('_seq')) {
          if (obj instanceof SeqRecord) {
            return obj.seq.type
          }
        }
      }
    } else {
      propNames = getPropNames(obj)
    }
  } catch {
    // const _ = 'getContentsType() failed to parse object.'
    // throw new Error(_)
  }

  if (propNames.includes('GBSeq_accession_version')) {
    rv = 'GBSeq'
  } else if (propNames.includes('TSeq_accver')) {
    rv = 'TSeq'
  } else if (propNames.includes('ParentTaxId')) {
    rv = 'Taxon'
  }
  return rv
}

export async function processFilePaths(paths: string[]) {
  const rv: {
    path: string
    mimeType: string
    contentsType: string
    parsed: unknown
  }[] = []
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    const parser = await getFileParser(path)
    const parsed = await parser(path).catch((reason) => {
      throw new Error(reason)
    })
    const fileType = await getFileType(path)
    let contentsType: string = '?'
    let mimeType: string = '?'
    if (fileType) {
      mimeType = fileType.mimeType
      try {
        contentsType = getContentsType(parsed)
      } catch (error) {
        //
      }
    }
    rv.push({ path, mimeType, contentsType, parsed })
  }
  return rv
}
