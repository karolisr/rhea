export function getPropNames<T>(obj: T) {
  return Object.getOwnPropertyNames(obj)
}

export function setDiff<T>(a: Set<T>, b: Set<T>) {
  return new Set([...a].filter((x) => !b.has(x)))
}
