function ChartMessageCard({ title, series = [] }) {
  const maxValue = series.length ? Math.max(...series.map((item) => item.value), 1) : 1

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
      {title ? <p className="mb-3 text-xs font-semibold text-slate-300">{title}</p> : null}
      <div className="space-y-2">
        {series.map((item) => {
          const widthPercent = Math.max(4, Math.round((item.value / maxValue) * 100))

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-slate-300">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded bg-slate-800">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color || '#22d3ee',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChartMessageCard
