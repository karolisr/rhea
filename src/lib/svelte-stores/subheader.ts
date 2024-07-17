import type { ComponentType } from 'svelte'
import { writable, type Writable } from 'svelte/store'

function init(): Writable<ComponentType | undefined> {
  return writable(undefined)
}

const subheader = init()
export default subheader
