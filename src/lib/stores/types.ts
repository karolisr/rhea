import { AppScale } from '$lib/utils'

export interface AppSettings {
  email: string
  ncbi_api_key: string
  // locale: string
  theme: string
  scale: keyof typeof AppScale
}

export interface AppState {
  [key: string]: unknown | undefined
}

export interface AppStatus {
  main: string
}

export interface DtdCache {
  [url: string]: string
}

export interface DtdText {
  url: string
  data: string
}
