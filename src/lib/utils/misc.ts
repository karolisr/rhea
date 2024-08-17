// --- Imports ----------------------------------------------------------------
// --- Code -------------------------------------------------------------------
function getPropNames<T>(obj: T) {
  return Object.getOwnPropertyNames(obj)
}

function makeNumericSeq(b: number, e: number, step: number = 1): Array<number> {
  if (step === 0) return []
  return Array.from(
    {
      length: (e - b) / step + 1
    },
    (_, i) => b + i * step
  )
}

function randomColor(
  minH = 0,
  maxH = 90,
  minS = 60,
  maxS = 65,
  minL = 60,
  maxL = 65
) {
  const h = Math.min(Math.random() * (maxH - minH) + minH, maxH)
  const s = Math.min(Math.random() * (maxS - minS) + minS, maxS)
  const l = Math.min(Math.random() * (maxL - minL) + minL, maxL)
  return `hsl(${h}deg, ${s}%, ${l}%)`
}

function removeCycle(obj: object, stack: object[] = []): object | string {
  if (!obj || typeof obj !== 'object') return obj
  if (stack.includes(obj)) return 'CYCLIC'
  let s = stack.concat([obj])
  return Array.isArray(obj)
    ? obj.map((x) => removeCycle(x, s))
    : Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, removeCycle(v, s)])
      )
}
// --- Exports ----------------------------------------------------------------
export { getPropNames }
export { randomColor }
export { removeCycle }
export { makeNumericSeq }
