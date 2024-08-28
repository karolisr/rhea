export { carriageReturnToNewLine }
export { oneLine }
export { escapeRegExp }
export { noWhiteSpaceAroundSep }
export { trimExtraWhiteSpace }
export { cleanContent }

function carriageReturnToNewLine(s: string): string {
  return s.replaceAll(/\r/g, '\n')
}

function oneLine(s: string): string {
  return s.replaceAll(/[\r\n]/g, ' ')
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function noWhiteSpaceAroundSep(s: string, seps: string[]): string {
  let rv = s

  for (let i = 0; i < seps.length; i++) {
    const sep = seps[i]
    const rx: RegExp = RegExp(`\\s*${escapeRegExp(sep)}\\s*`, 'g')
    rv = rv.replaceAll(rx, sep)
  }

  return rv
}

function trimExtraWhiteSpace(s: string): string {
  const rx: RegExp = /\s+/g
  return s.replaceAll(rx, ' ')
}

function cleanContent(s: string, seps: string[]): string {
  return noWhiteSpaceAroundSep(trimExtraWhiteSpace(s), seps)
}
