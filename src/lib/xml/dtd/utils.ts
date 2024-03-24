import type { Indexed } from '$lib/types'
import { getPropNames, setDiff } from '$lib'
import { element_value_type } from '.'

export function elements_to_json(elements: {
  [element_name: string]: _dtd_element
}): Indexed {
  return _elements_to_json(elements)._rv
}

export function _never_children(elements: {
  [element_name: string]: _dtd_element
}): Set<string> {
  const ns: Set<string> = new Set(getPropNames(elements))
  const ncs: Set<string> = new Set()
  for (const n of ns) {
    const e = elements[n]
    if (e.children) {
      getPropNames(e.children).forEach((nc) => {
        ncs.add(nc)
      })
    }
  }
  const nsDiff = setDiff(ns, ncs)
  const rv: Set<string> = new Set()
  for (const n of nsDiff) {
    const e = elements[n]
    if (e.children) {
      rv.add(n)
    }
  }
  return rv
}

function _build_object(
  rootName: string,
  parts: Indexed,
  done: Set<string> = new Set(),
  level: number = 0
): { _obj: Indexed; _level: number } {
  const obj: Indexed = parts[rootName] as Indexed
  const cns = getPropNames(obj)
  for (const cn of cns) {
    if (done.has(rootName + cn)) {
      level = level - 1
      continue
    }
    if (cn in parts) {
      done.add(rootName + cn)
      const objc = obj[cn] as Indexed
      const { _obj, _level } = _build_object(cn, parts, done, level)
      level = level + 1
      level = level - _level
      for (const _objn of getPropNames(_obj)) {
        objc[_objn] = _obj[_objn]
      }
    }
  }
  return { _obj: obj, _level: level }
}

function _elements_to_json(
  elements: { [element_name: string]: _dtd_element },
  element_name: string | null = null,
  level: number = 0
): { _rv: Indexed; _level: number } {
  let rv: Indexed = {}

  if (element_name) {
    // WHEN: element_name !== null
    const el = elements[element_name]
    if (el.children) {
      // WHEN: el.children !== undefined
      const ecns = getPropNames(el.children)
      for (const ecn of ecns) {
        level = level - 1
        const c = el.children[ecn]
        if (!(ecn in rv)) rv[ecn] = {}
        const rvc = rv[ecn] as Indexed
        if (c.required === 'ARRAY') {
          rv['type'] = `Array<${ecn}>`
        } else {
          rvc['required'] = c.required.toLowerCase()
        }
      }
    } else {
      // WHEN: el.children === undefined
      if (el.attributes) {
        const ans = getPropNames(el.attributes)
        for (const an of ans) {
          const a = el.attributes[an]
          if (an === 'value') {
            rv = {
              type: a.type,
              possible_values: a.possible_values
            }
          } else {
            if (!('attributes' in rv)) rv['attributes'] = {}
            const rva = rv['attributes'] as Indexed
            rva[an] = a
          }
        }
      } else {
        if (el.value)
          rv = {
            type: element_value_type[el.value.type]
          }
      }
    }
  } else {
    // WHEN: element_name === null

    const parts: Indexed = {}
    const levels: Indexed = {}
    for (const en of getPropNames(elements)) {
      const { _rv, _level } = _elements_to_json(elements, en)
      parts[en] = _rv
      levels[en] = _level
    }

    // const parents: Set<string> = _never_children(elements)
    // let rootName: string | undefined
    // if (parents.size === 1) {
    //   rootName = [...parents][0]
    // }

    // if (rootName) {
    //   rv[rootName] = _build_object(rootName, parts)
    // } else {
    //   console.warn('No parent element or too many parents:', parents)
    // }

    const objs: Indexed = {}
    for (const en of getPropNames(elements)) {
      const { _obj, _level } = _build_object(en, parts)
      objs[en] = _obj
      levels[en] = (levels[en] as number) + _level
    }

    const rootName = Object.entries(levels).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0][0]
    rv[rootName] = objs[rootName]
  }

  return { _rv: rv, _level: level }
}
