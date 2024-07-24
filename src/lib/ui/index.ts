import type { Unlistener } from '$lib/types'

export function preventDefault(k: keyof WindowEventMap): Unlistener {
  const f = (e: Event) => {
    e.preventDefault()

    if (!['dragover'].includes(e.type)) {
      console.log(
        e.type,

        e.currentTarget instanceof Element
          ? e.currentTarget.id || e.currentTarget.tagName
          : e.AT_TARGET,

        e.target instanceof Element
          ? e.target.id || e.target.tagName
          : e.AT_TARGET
      )
    }
  }
  document.body.addEventListener(k, f, { capture: true, passive: false })

  return () => {
    document.body.removeEventListener(k, f, { capture: true })
  }
}
