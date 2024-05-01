import { fetch } from '@tauri-apps/plugin-http'

export async function dnld(
  url: string,
  rt: 'text' | 'blob'
): Promise<{ url: string; data: string | Blob }> {
  return await fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`Error downloading: ${r.url} (${r.status})`)
    const rv = {
      url: r.url,
      data: rt === 'text' ? await r.text() : await r.blob()
    }
    return rv
  })
}

export async function dnld_txt(
  url: string
): Promise<{ url: string; data: string } | null> {
  const _ = await dnld(url, 'text').catch((_) => {
    return null
  })
  if (_) {
    return { url: _.url, data: _.data as string }
  } else {
    return null
  }
}
