import _ from './TableView.svelte'
export const TableView = _

export function getRowHeight(uid: string): { rowH: number; chrW: number } {
  const _table = document.createElement('div')
  const _row = document.createElement('div')
  const _cell = document.createElement('div')
  _table.className = 'table'
  _row.className = 'row-b'
  _cell.className = 'cell'
  _cell.textContent = '__13__ac__46__'
  _row.appendChild(_cell)
  _table.appendChild(_row)
  const _container = document.getElementById(`${uid}-table-container`)
  if (_container === null) return { rowH: -1, chrW: -1 }
  _container.appendChild(_table)
  const rowH = _row.offsetHeight
  const chrW = Math.floor(_cell.offsetWidth / _cell.textContent.length) + 0.5
  _cell.remove()
  _row.remove()
  _table.remove()
  return { rowH, chrW }
}
