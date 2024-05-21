import { getCurrent } from '@tauri-apps/api/webviewWindow'
import { readTextFile, readFile } from '@tauri-apps/plugin-fs'
import { parse_dtd_txt } from '$lib/xml/dtd'
import { parse_xml_txt } from '$lib/xml'

import fileTypeChecker from 'file-type-checker'
import { getPropNames } from '$lib'
import type { FileSignature } from 'file-type-checker/dist/core'
import type { Unlistener } from '$lib/types'

import { insertGbSeqRecords } from './db/gbseq'
import type { GBSet } from '$lib/ncbi/types/GBSet'

export async function getFileType(path: string) {
  const fbin = await readFile(path).catch((error) => {
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
    const txt = await readTextFile(path)
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
      default:
        break
    }
  }
  return otherParser()
}

export function getContentsType(obj: object) {
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

async function tmp(paths: string[]) {
  for (let i = 0; i < paths.length; i++) {
    const p = paths[i]
    // const parser = await getFileParser(p)
    // const parsed = await parser(p).catch((reason) => {
    //   throw new Error(reason)
    // })
    // console.log(getContentsType(parsed as object), parsed)
    // if (getContentsType(parsed as object) === 'GBSeq') {
    const parsed = await (await txtParser(parse_xml_txt))(p)
    console.log('insertGbSeqRecords', (parsed as GBSet).length)
    await insertGbSeqRecords(parsed as GBSet)
  }
}

export async function dragDropFileListener(): Promise<Unlistener> {
  const retFun = await getCurrent().onDragDropEvent((event) => {
    if (event.payload.type === 'dragged') {
      console.info('Hovering:', event.payload.paths)
    } else if (event.payload.type === 'dragOver') {
      // console.info('Hovering at:', event.payload.position)
    } else if (event.payload.type === 'dropped') {
      const paths = event.payload.paths
      console.info('Dropped:', paths)
      tmp(paths)
    } else {
      console.info('Drop Cancelled.')
    }
  })
  return retFun
}
