import { writable } from 'svelte/store'
import ContextMenu from '$lib/ui/components/ContextMenu.svelte'

export interface ContextMenuItem {
  label?: string
  hotKey?: string
  children?: ContextMenuItem[]
  disabled?: boolean
  action?: () => void
}

let cm: ContextMenu | undefined

function init() {
  const _ = {
    show: showContextMenu,
    hide: hideContextMenu
  }
  return writable(_)
}

function showContextMenu(e: MouseEvent, items: ContextMenuItem[]) {
  cm = new ContextMenu({
    target: document.body,
    props: { x: e.x - 5, y: e.y - 5, hide: hideContextMenu, items }
  })
}

function hideContextMenu() {
  cm?.$destroy()
  cm = undefined
}

const contextMenu = init()
export default contextMenu
