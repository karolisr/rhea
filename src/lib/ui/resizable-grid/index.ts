import _ from './ResizableGrid.svelte'
export const ResizableGrid = _

export function makeGridTemplate(
  sizes: number[],
  gridSize: number | undefined
) {
  let sumOfFractions = 0
  let sumOfPixels = 0

  let gridTemplate = ''
  let calculatedSizes: number[] = []

  for (let i = 0; i < sizes.length; i++) {
    let size = sizes[i]

    if (size < 0) {
      calculatedSizes.push(size)
      size = Math.abs(size)
      gridTemplate += ` ${size}fr`
      sumOfFractions += size
    } else {
      calculatedSizes.push(size)
      gridTemplate += ` ${size}px`
      sumOfPixels += size
    }
  }

  gridTemplate = gridTemplate.trim()

  let remaining: number | undefined
  if (gridSize !== undefined) {
    remaining = gridSize - sumOfPixels
    for (let i = 0; i < calculatedSizes.length; i++) {
      let size = calculatedSizes[i]
      if (size < 0) {
        size = (remaining / sumOfFractions) * Math.abs(size)
        calculatedSizes[i] = size
      }
    }
  } else {
    calculatedSizes = []
  }
  return { gridTemplate, calculatedSizes }
}
