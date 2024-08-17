import { writable, type Writable } from 'svelte/store'
import { replacer, reviver } from '$lib/utils'
import type { AppState } from '.'

const key = 'state'

function init(): Writable<AppState> {
  const st_stored = localStorage.getItem(key)
  let st: AppState = {}
  if (st_stored) {
    st = JSON.parse(st_stored, reviver)
  }
  return writable(st)
}

export const appState = init()

export function saveAppState(): void {
  appState.update((st) => {
    localStorage.setItem(key, JSON.stringify(st, replacer))
    return st
  })
}
