import { BROWSER } from '.'

let _fetch: typeof fetch

async function dynamicImports() {
  if (BROWSER === 'Tauri') {
    await import('@tauri-apps/plugin-http')
      .then((_) => {
        _fetch = _.fetch
      })
      .catch(() => {
        _fetch = fetch
      })
  } else {
    _fetch = fetch
  }
}

export async function download(
  url: string,
  rt: 'text' | 'blob'
): Promise<{ url: string; data: string | Blob }> {
  await dynamicImports()
  return await _fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`Error downloading: ${r.url} (${r.status})`)
    const rv = {
      url: r.url,
      data: rt === 'text' ? await r.text() : await r.blob()
    }
    return rv
  })
}

export async function downloadText(
  url: string
): Promise<{ url: string; data: string } | null> {
  const _ = await download(url, 'text').catch((_) => {
    return null
  })
  if (_) {
    return { url: _.url, data: _.data as string }
  } else {
    return null
  }
}
