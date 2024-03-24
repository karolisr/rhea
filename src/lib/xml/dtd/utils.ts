import type { Indexed } from '$lib/types'
import { getPropNames, setDiff } from '$lib'
import { element_value_type } from '.'

export function elements_to_json(elements: {
  [element_name: string]: _dtd_element
}): Indexed {
  return _elements_to_json(elements)
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
  done: Indexed = {}
): { _obj: Indexed; _done: Indexed } {
  const obj: Indexed = parts[rootName] as Indexed
  const cns = getPropNames(obj)
  for (const cn of cns) {
    const k = `${rootName} ${cn}`
    if (k in (done as Indexed)) {
      continue
    }
    if (cn in parts) {
      done[k] = { p: rootName, c: cn }
      const objc = obj[cn] as Indexed
      const { _obj } = _build_object(cn, parts, done)
      for (const _objn of getPropNames(_obj)) {
        objc[_objn] = _obj[_objn]
      }
    }
  }

  return { _obj: obj, _done: done }
}

function _elements_to_json(
  elements: { [element_name: string]: _dtd_element },
  element_name: string | null = null
): Indexed {
  let rv: Indexed = {}
  if (element_name) {
    // WHEN: element_name !== null
    const el = elements[element_name]
    if (el.children) {
      // WHEN: el.children !== undefined
      const ecns = getPropNames(el.children)
      for (const ecn of ecns) {
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
    for (const en of getPropNames(elements)) {
      parts[en] = _elements_to_json(elements, en)
    }

    const objs: Indexed = {}
    const dones: Indexed = {}
    for (const en of getPropNames(elements)) {
      const { _obj, _done } = _build_object(en, parts)
      objs[en] = _obj
      dones[en] = _done
    }

    const _ = getPropNames(dones)
    let counts: [string, number][] = []
    for (const k of _) {
      const v = dones[k]
      if (getPropNames(v).length !== 0) {
        counts.push([k, getPropNames(v).length])
      }
    }

    counts = counts.sort((a, b) => (b[1] as number) - (a[1] as number))
    const rootName = counts[0][0]
    rv[rootName] = objs[rootName]
  }

  return rv
}
