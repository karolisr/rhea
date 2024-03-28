import type { PageLoad } from './$types'

export const load = (async (raw) => {
  const params: Record<string, string> = raw.params
  const recid: string = params.recid
  return { recid }
}) satisfies PageLoad
