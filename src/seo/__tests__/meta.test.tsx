import { render } from '@testing-library/react'
import { SeoHead } from '../meta'

describe('SeoHead', () => {
  it('sets title, canonical and JSON-LD', () => {
    render(<SeoHead title="Test Title" description="Desc" url="https://example.com/page" jsonLd={{ '@context': 'https://schema.org', '@type':'Thing', name:'X' }} />)
    expect(document.title).toBe('Test Title')
    const link = document.querySelector("link[rel='canonical']") as HTMLLinkElement
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('https://example.com/page')
    const script = document.querySelector("script[type='application/ld+json']") as HTMLScriptElement
    expect(script).toBeTruthy()
    expect(script.textContent).toContain('schema.org')
  })
})

