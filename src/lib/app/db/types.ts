import type { DBSchema } from 'idb'
import type { ESummaryNuccore } from '$lib/ncbi'

export interface CDSDB extends DBSchema {
  nt: {
    key: string
    value: ESummaryNuccore
  }
  xml: {
    key: string
    value: {
      accver: string
      text: string
    }
  }
}
