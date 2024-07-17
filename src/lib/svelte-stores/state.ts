import { writable, type Writable } from 'svelte/store'
import { replacer, reviver } from '$lib/api'

export interface State {
  [key: string]: unknown | undefined
}

const key = 'state'

function init(): Writable<State> {
  const st_stored = localStorage.getItem(key)
  let st: State = {}
  if (st_stored) {
    st = JSON.parse(st_stored, reviver)
  }
  return writable(st)
}

const state = init()
export default state

export function saveState(): void {
  state.update((st) => {
    localStorage.setItem(key, JSON.stringify(st, replacer))
    return st
  })
}
