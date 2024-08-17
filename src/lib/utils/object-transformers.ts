// --- Imports ----------------------------------------------------------------
// --- Code -------------------------------------------------------------------
function replacer(_: string, value: unknown): unknown {
  if (value instanceof Map) {
    return { dataType: 'Map', value: Array.from([...value]) }
  } else if (value instanceof Set) {
    return { dataType: 'Set', value: Array.from([...value]) }
  } else {
    return value
  }
}

function reviver(
  _: string,
  obj: {
    dataType: string
    value: Array<[unknown, unknown]>
  }
): unknown {
  if (obj['dataType'] === 'Map') {
    return new Map(obj['value'])
  } else if (obj['dataType'] === 'Set') {
    return new Set(obj['value'])
  } else {
    return obj
  }
}
// --- Exports ----------------------------------------------------------------
export { replacer }
export { reviver }
