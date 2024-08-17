// --- Imports ----------------------------------------------------------------
import { getCurrentWindow, cursorPosition } from '@tauri-apps/api/window'
import { LogicalPosition } from '@tauri-apps/api/dpi'

import type {
  Submenu,
  MenuItem,
  PredefinedMenuItem,
  CheckMenuItem,
  IconMenuItem,
  MenuItemOptions,
  SubmenuOptions,
  IconMenuItemOptions,
  PredefinedMenuItemOptions,
  CheckMenuItemOptions
} from '@tauri-apps/api/menu'

import { Menu } from '@tauri-apps/api/menu'

// --- Code -------------------------------------------------------------------
async function showContextMenu(
  items: Array<
    | Submenu
    | MenuItem
    | PredefinedMenuItem
    | CheckMenuItem
    | IconMenuItem
    | MenuItemOptions
    | SubmenuOptions
    | IconMenuItemOptions
    | PredefinedMenuItemOptions
    | CheckMenuItemOptions
  >
) {
  const factor = await getCurrentWindow().scaleFactor()
  const op = (await getCurrentWindow().outerPosition()).toLogical(factor)
  const cp = (await cursorPosition()).toLogical(factor)
  const x = Math.floor(cp.x - op.x) + 0.5 * factor
  const y = Math.floor(cp.y - op.y)
  const pos = new LogicalPosition(x, y)
  const menu = await Menu.new({ items })
  menu.popup(pos)
}

// --- Exports ----------------------------------------------------------------
export { showContextMenu }

export type {
  MenuItemOptions,
  SubmenuOptions,
  IconMenuItemOptions,
  PredefinedMenuItemOptions,
  CheckMenuItemOptions,
  AboutMetadata
} from '@tauri-apps/api/menu'

export {
  Menu,
  Submenu,
  MenuItem,
  PredefinedMenuItem,
  CheckMenuItem,
  IconMenuItem
} from '@tauri-apps/api/menu'
