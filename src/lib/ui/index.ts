export function disableDefault(k: keyof DocumentEventMap) {
  document.addEventListener(
    k,
    (e) => {
      e.preventDefault()
      return false
    },
    { capture: true }
  )
}
