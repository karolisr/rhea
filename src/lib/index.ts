export function getPropNames<T>(obj: T) {
  return Object.getOwnPropertyNames(obj)
}

export function setDiff<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((x) => !b.has(x)))
}

export function removeCycle(obj: object, stack: object[] = []): object | string {
  if (!obj || typeof obj !== 'object') return obj
  if (stack.includes(obj)) return 'CYCLIC'
  let s = stack.concat([obj])
  return Array.isArray(obj)
    ? obj.map((x) => removeCycle(x, s))
    : Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, removeCycle(v, s)])
      )
}
