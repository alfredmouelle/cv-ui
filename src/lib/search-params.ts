export function parseRepeatedSearchString(searchString: string): Record<string, string | string[]> {
  const params = new URLSearchParams(searchString)
  const parsed: Record<string, string | string[]> = {}

  for (const key of new Set(params.keys())) {
    const values = params.getAll(key)
    parsed[key] = values.length === 1 ? String(values[0]) : values
  }

  return parsed
}

export function stringifyRepeatedSearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (typeof item === 'string' && item !== '') params.append(key, item)
    }
  }

  const encoded = params.toString()

  return encoded === '' ? '' : `?${encoded}`
}
