export function disableDefault(k: keyof DocumentEventMap) {
  document.addEventListener(
    k,
    (e) => {
      e.preventDefault()

      // console.log(
      //   e.type,
      //   e.target instanceof HTMLElement
      //     ? e.target.tagName + ': ' + e.target.id
      //     : e.AT_TARGET
      // )

      return false
    },
    { capture: true }
  )
}
