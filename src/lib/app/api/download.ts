import {
  fetch,
  ResponseType as RT,
  type FetchOptions
} from '@tauri-apps/api/http'

export async function dnld(url: string, rt: keyof typeof RT) {
  const opts: FetchOptions = { method: 'GET', responseType: RT[rt] }
  return await fetch<RT>(url, opts).then((r) => {
    if (!r.ok) throw new Error(`Error downloading: ${r.url} (${r.status})`)
    return { url: r.url, data: r.data }
  })
}

export async function dnld_txt(url: string) {
  const _ = await dnld(url, 'Text')
  return { url: _.url, data: _.data as unknown as string }
}
