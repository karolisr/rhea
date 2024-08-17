// --- Imports ----------------------------------------------------------------
import { fetch as serverFetch } from '@tauri-apps/plugin-http'

// --- Code -------------------------------------------------------------------
async function download(
  url: string,
  rt: 'text' | 'blob' | 'json',
  server: boolean = true
): Promise<{
  url: string
  data: string | Blob | object
}> {
  let _fetch: typeof fetch = fetch
  if (server) _fetch = serverFetch
  return await _fetch(url).then(async (r) => {
    if (!r.ok) throw new Error(`Error downloading: ${r.url} (${r.status})`)

    let data: string | Blob | object
    switch (rt) {
      case 'text':
        data = await r.text()
        break

      case 'blob':
        data = await r.blob()
        break

      case 'json':
        data = await r.json()
        break
    }

    const rv = {
      url: r.url,
      data
    }
    return rv
  })
}

async function downloadText(url: string): Promise<{
  url: string
  data: string
} | null> {
  const _ = await download(url, 'text', true).catch((_) => {
    return null
  })
  if (_) {
    return {
      url: _.url,
      data: _.data as string
    }
  } else {
    return null
  }
}

// --- Exports ----------------------------------------------------------------
export { serverFetch }
export { download }
export { downloadText }
