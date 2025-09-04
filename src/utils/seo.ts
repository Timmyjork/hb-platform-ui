export function setMeta({ title, canonical }: { title?: string; canonical?: string }) {
  if (title) document.title = title
  if (canonical) {
    let link = document.querySelector('link[rel=canonical]') as HTMLLinkElement | null
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = canonical
  }
}

export function queenSeoSlug(id: string, hint?: string): string {
  return `${id.replace(/[.]/g,'-')}--${(hint||'queen').toLowerCase().replace(/\s+/g,'-')}`
}

export function productSchema(listing: { listingId: string; price: number; sellerId: string }) {
  return { '@context': 'https://schema.org', '@type': 'Product', sku: listing.listingId, offers: { '@type': 'Offer', price: listing.price, priceCurrency: 'UAH' }, brand: listing.sellerId }
}

export function organizationSchema(seller: { id: string; name: string }) {
  return { '@context': 'https://schema.org', '@type': 'Organization', name: seller.name, url: window.location.origin + '/breeder/' + seller.id }
}

