import { describe, expect, it } from 'vitest'

import { parseRepeatedSearchString, stringifyRepeatedSearch } from '../search-params'
import { validateCatalogSearch } from './catalog-search'

const canonicalUrl = (searchString: string): string =>
  stringifyRepeatedSearch(validateCatalogSearch(parseRepeatedSearchString(searchString)))

describe('parseRepeatedSearchString', () => {
  it('keeps repeated keys as ordered values', () => {
    expect(
      parseRepeatedSearchString('?q=two+column&layout=two-column&layout=single-column'),
    ).toEqual({
      q: 'two column',
      layout: ['two-column', 'single-column'],
    })
  })
})

describe('validateCatalogSearch', () => {
  it('omits an empty search, empty dimensions, and the default sort', () => {
    expect(validateCatalogSearch({ q: '   ', layout: [], sort: 'catalog' })).toEqual({})
  })

  it('trims search text and collapses whitespace runs', () => {
    expect(validateCatalogSearch({ q: '  ATS   clean\tresume ' })).toEqual({
      q: 'ATS clean resume',
    })
  })

  it('collapses duplicates and restores the contract order of each dimension', () => {
    expect(
      validateCatalogSearch({
        tone: ['expressive', 'classic', 'expressive'],
        layout: ['two-column', 'single-column'],
      }),
    ).toEqual({ layout: ['single-column', 'two-column'], tone: ['classic', 'expressive'] })
  })

  it('drops unknown keys and unsupported values', () => {
    expect(
      validateCatalogSearch({
        layout: ['three-column', 'single-column'],
        sort: 'popularity',
        page: '2',
      }),
    ).toEqual({ layout: ['single-column'] })
  })

  it('keeps the name sort and collapses a repeated sort value', () => {
    expect(validateCatalogSearch({ sort: 'name' })).toEqual({ sort: 'name' })
    expect(validateCatalogSearch({ sort: ['name', 'name'] })).toEqual({ sort: 'name' })
    expect(validateCatalogSearch({ sort: ['name', 'catalog'] })).toEqual({ sort: 'name' })
  })
})

describe('stringifyRepeatedSearch', () => {
  it('writes the canonical key order with UTF-8 URLSearchParams encoding', () => {
    expect(
      stringifyRepeatedSearch(
        validateCatalogSearch({
          sort: 'name',
          photo: ['not-supported'],
          density: ['balanced'],
          tone: ['modern'],
          ats: ['visual-first'],
          layout: ['two-column', 'single-column'],
          q: 'CV élégant',
        }),
      ),
    ).toBe(
      '?q=CV+%C3%A9l%C3%A9gant&layout=single-column&layout=two-column&ats=visual-first&tone=modern&density=balanced&photo=not-supported&sort=name',
    )
  })

  it('writes an empty string for the default discovery state', () => {
    expect(stringifyRepeatedSearch(validateCatalogSearch({}))).toBe('')
  })

  it('removes unknown keys, unsupported values, and defaults on the next update', () => {
    expect(
      canonicalUrl('?page=2&layout=single-column&layout=single-column&sort=catalog&q=+ats+'),
    ).toBe('?q=ats&layout=single-column')
  })
})
