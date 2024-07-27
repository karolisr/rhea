import { min } from '$lib'
import type { Unlistener } from '$lib/types'

export function getPropNames<T>(obj: T) {
  return Object.getOwnPropertyNames(obj)
}

// It's finally here!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/difference
// export function setDiff<T>(a: Set<T>, b: Set<T>) {
//   return new Set([...a].filter((x) => !b.has(x)))
// }

export function removeCycle(
  obj: object,
  stack: object[] = []
): object | string {
  if (!obj || typeof obj !== 'object') return obj
  if (stack.includes(obj)) return 'CYCLIC'
  let s = stack.concat([obj])
  return Array.isArray(obj)
    ? obj.map((x) => removeCycle(x, s))
    : Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, removeCycle(v, s)])
      )
}

export function seq(b: number, e: number, step: number = 1) {
  if (step === 0) return []
  return Array.from(
    {
      length: (e - b) / step + 1
    },
    (_, i) => b + i * step
  )
}

export function randomColor(
  minH = 0,
  maxH = 90,
  minS = 60,
  maxS = 65,
  minL = 60,
  maxL = 65
) {
  const h = min(Math.random() * (maxH - minH) + minH, maxH)
  const s = min(Math.random() * (maxS - minS) + minS, maxS)
  const l = min(Math.random() * (maxL - minL) + minL, maxL)
  return `hsl(${h}deg, ${s}%, ${l}%)`
}

export function preventDefault(k: keyof WindowEventMap): Unlistener {
  const f = (e: Event) => {
    e.preventDefault()
    // if (!['dragover'].includes(e.type)) {
    //   console.log(
    //     e.type,

    //     e.currentTarget instanceof Element
    //       ? e.currentTarget.id || e.currentTarget.tagName
    //       : e.AT_TARGET,

    //     e.target instanceof Element
    //       ? e.target.id || e.target.tagName
    //       : e.AT_TARGET,

    //     e
    //   )
    // }
  }
  document.addEventListener(k, f, { capture: true, passive: false })

  return () => {
    document.removeEventListener(k, f, { capture: true })
  }
}
