// --- Imports ----------------------------------------------------------------
import { Menu, Submenu, PredefinedMenuItem, MenuItem } from '$lib/backend/menu'
import type { AboutMetadata } from '$lib/backend/menu'

// --- Code -------------------------------------------------------------------

const about: AboutMetadata = {
  name: 'Rhea',
  copyright: '© 2024 Karolis Ramanauskas'
}

async function initMainMenu() {
  // --- Top Level Sub-Menus ---
  const smApp = await Submenu.new({ text: 'Rhea' })
  const smFile = await Submenu.new({ text: 'File' })
  const smEdit = await Submenu.new({ text: 'Edit' })
  // const smView = await Submenu.new({ text: 'View' })
  // const smWindow = await Submenu.new({ text: 'Window' })
  // const smHelp = await Submenu.new({ text: 'Help' })

  // --- Sub-Menus ---
  const smImport = await Submenu.new({ text: 'Import' })
  const smExport = await Submenu.new({ text: 'Export' })

  // --- Menu Items ---
  const miSep = await PredefinedMenuItem.new({ item: 'Separator' })

  const miAbout = await PredefinedMenuItem.new({
    item: { About: about },
    text: 'About Rhea'
  })

  const miQuit = await PredefinedMenuItem.new({
    item: 'Quit',
    text: 'Quit Rhea'
  })

  const miCopy = await PredefinedMenuItem.new({
    item: 'Copy'
  })

  const miCut = await PredefinedMenuItem.new({
    item: 'Cut'
  })

  const miPaste = await PredefinedMenuItem.new({
    item: 'Paste'
  })

  const miImportFasta = await MenuItem.new({ text: 'FASTA', enabled: false })
  const miExportFasta = await MenuItem.new({ text: 'FASTA', enabled: false })

  // --- Put it all together ---
  smApp.append([miAbout, miSep, miQuit])
  smFile.append([smImport, smExport])
  smImport.append([miImportFasta])
  smExport.append([miExportFasta])
  smEdit.append([miCopy, miCut, miPaste])

  // --- Prepare the Main Menu ---
  let mMain = await Menu.new()
  // smView, smWindow, smHelp
  mMain.append([smApp, smFile, smEdit])
  await mMain.setAsAppMenu()
}

// --- Exports ----------------------------------------------------------------

export { initMainMenu }
