import { writable, type Writable } from 'svelte/store'
import type { AppStatus } from '.'

function init(): Writable<AppStatus> {
  const store: AppStatus = {
    main: ''
  }
  return writable(store)
}

export const appStatus = init()
