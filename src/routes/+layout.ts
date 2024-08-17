import '$styles/app.scss'

export const prerender = true
export const ssr = false
export const csr = true
export const trailingSlash = 'always'

import type { ComponentType } from 'svelte'
import type { LayoutLoad, RouteParams } from './$types'

interface LD extends LayoutLoad {
  routeParams: RouteParams
  layout: {
    subheader: ComponentType | undefined
  }
}

export const load: LayoutLoad = ({ params }) => {
  return {
    routeParams: params,
    layout: { subheader: undefined }
  } as LD
}
