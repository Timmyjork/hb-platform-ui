import { useEffect } from 'react'

export function SeoHead({ title, description, url, jsonLd }: { title: string; description?: string; url?: string; jsonLd?: unknown }) {
  useEffect(() => {
    document.title = title
    function setMeta(name: string, content?: string) {
      if (!content) return
      let el = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    setMeta('description', description)
    return () => {}
  }, [title, description])
  return (
    <>
      {url && <link rel="canonical" href={url} />}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  )
}
