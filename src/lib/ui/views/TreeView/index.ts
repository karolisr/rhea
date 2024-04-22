import TreeView from './TreeView.svelte'

export interface CollTree {
  children: CollTree[]
  label: string
  id: string
  notes: string
}

export default TreeView
