import { writable, type Writable } from 'svelte/store'
import { type ESummaryNuccore } from '$lib/ncbi'

interface SearchStore {
  results: ESummaryNuccore[]
  fresh: boolean
}

function init(): Writable<SearchStore> {
  const store: SearchStore = {
    results: [],
    fresh: false
  }
  return writable(store)
}

const searchStore = init()
export default searchStore
