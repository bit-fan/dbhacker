function TableMessageCard({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="bg-slate-900/80 text-slate-300">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-slate-700 px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row.join('-')}`} className="odd:bg-slate-900/30 even:bg-slate-900/10">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="border-b border-slate-800 px-3 py-2 text-slate-200">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableMessageCard
