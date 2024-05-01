import { getCurrent } from '@tauri-apps/api/webviewWindow'
import { readTextFile, readFile } from '@tauri-apps/plugin-fs'
import { parse_dtd_txt } from '$lib/xml/dtd'
import { parse_xml_txt } from '$lib/xml'

import fileTypeChecker from 'file-type-checker'
import type { FileSignature } from 'file-type-checker/dist/core'

export async function get_file_type(path: string) {
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

export async function get_file_parser(path: string) {
  const other_parser = () => {
    return async (path: string) => {
      console.info(`Default parser. Doing nothing with: ${path}`)
    }
  }

  const txt_parser = async (f: (txt: string) => unknown) => {
    return async (path: string) => {
      const txt = await readTextFile(path)
      return f(txt)
    }
  }

  const info = await get_file_type(path)

  if (info) {
    switch (info.mimeType) {
      case 'text/dtd':
        return txt_parser(parse_dtd_txt)
      case 'text/xml':
        return txt_parser(parse_xml_txt)
      default:
        break
    }
  }
  return other_parser()
}

export async function fileDropListener(): Promise<() => void> {
  const retFun = await getCurrent().onDragDropEvent((event) => {
    if (event.payload.type === 'dragOver') {
      console.info('Hovering:', event.payload.position)
    } else if (event.payload.type === 'dropped') {
      console.info('Dropped:', event.payload.paths)
      event.payload.paths.forEach(async (p) => {
        const parser = await get_file_parser(p)
        const parsed = await parser(p).catch((reason) => {
          console.error(reason)
        })
        console.log(parsed)
      })
    } else {
      console.info('Drop Cancelled.')
    }
  })
  return retFun
}
