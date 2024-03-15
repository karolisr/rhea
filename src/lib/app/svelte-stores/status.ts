import { writable, type Writable } from 'svelte/store'

interface AppStatus {
  main: string
}

function init(): Writable<AppStatus> {
  const store: AppStatus = {
    main: 'main'
  }
  return writable(store)
}

const status = init()
export default status
