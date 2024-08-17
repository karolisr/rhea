// --- Imports ----------------------------------------------------------------
import type { Unlistener } from '$lib/types'

// --- Code -------------------------------------------------------------------
function preventDefault(
  k: keyof WindowEventMap,
  capture: boolean = true,
  log: boolean = false
): Unlistener {
  const f = (e: Event) => {
    e.preventDefault()
    if (log) {
      console.log(
        e.type,

        e.currentTarget instanceof Element
          ? e.currentTarget.id || e.currentTarget.tagName
          : e.AT_TARGET,

        e.target instanceof Element
          ? e.target.id || e.target.tagName
          : e.AT_TARGET,

        e
      )
    }
  }
  document.addEventListener(k, f, { capture, passive: false })

  return () => {
    document.removeEventListener(k, f, { capture })
  }
}
// --- Exports ----------------------------------------------------------------
export { preventDefault }
