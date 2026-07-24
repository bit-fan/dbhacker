const ABSOLUTE_OR_DATA_URL = /^(?:[a-z]+:)?\/\//i

function normalizeImageSrc(src) {
  if (!src || ABSOLUTE_OR_DATA_URL.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }

  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const normalizedPath = src.startsWith('/') ? src.slice(1) : src

  return `${normalizedBase}/${normalizedPath}` || '/'
}

function ImageMessageCard({ src, alt, caption }) {
  const resolvedSrc = normalizeImageSrc(src)

  return (
    <figure className="overflow-hidden rounded-md border border-blue-500/35 bg-[#001124]">
      <img src={resolvedSrc} alt={alt || 'chat image'} className="h-auto w-full object-cover" loading="lazy" />
      {caption ? <figcaption className="px-3 py-2 text-xs text-blue-100/80">{caption}</figcaption> : null}
    </figure>
  )
}

export default ImageMessageCard
