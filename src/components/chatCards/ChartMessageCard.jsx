function ChartMessageCard({ title, series = [] }) {
  const maxValue = series.length ? Math.max(...series.map((item) => item.value), 1) : 1

  return (
    <div className="rounded-md border border-blue-500/35 bg-[#001124] p-3">
      {title ? <p className="mb-3 text-xs font-semibold text-blue-100">{title}</p> : null}
      <div className="space-y-2">
        {series.map((item) => {
          const widthPercent = Math.max(4, Math.round((item.value / maxValue) * 100))

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-blue-100/85">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded bg-[#00274f]">
                <div
                  className="h-2 rounded"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color || '#0072ce',
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
