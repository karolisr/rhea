import type { Unlistener } from '$lib/types'
export function preventDefault(k: keyof WindowEventMap): Unlistener {
  const f = (e: Event) => {
    e.preventDefault()
    // console.log(
    //   e.type,
    //   e.target instanceof HTMLElement
    //     ? e.target.tagName + ': ' + e.target.id
    //     : e.AT_TARGET
    // )
  }
  window.addEventListener(k, f, {
    capture: false
  })

  return () => {
    window.removeEventListener(k, f)
  }
}
