function ImageMessageCard({ src, alt, caption }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/40">
      <img src={src} alt={alt || 'chat image'} className="h-auto w-full object-cover" loading="lazy" />
      {caption ? <figcaption className="px-3 py-2 text-xs text-slate-300">{caption}</figcaption> : null}
    </figure>
  )
}

export default ImageMessageCard
