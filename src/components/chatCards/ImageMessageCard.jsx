function ImageMessageCard({ src, alt, caption }) {
  return (
    <figure className="overflow-hidden rounded-md border border-blue-500/35 bg-[#001124]">
      <img src={src} alt={alt || 'chat image'} className="h-auto w-full object-cover" loading="lazy" />
      {caption ? <figcaption className="px-3 py-2 text-xs text-blue-100/80">{caption}</figcaption> : null}
    </figure>
  )
}

export default ImageMessageCard
