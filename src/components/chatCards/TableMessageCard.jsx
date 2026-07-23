function TableMessageCard({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-blue-500/35 bg-[#001124]">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="bg-blue-500/20 text-blue-100">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-blue-500/35 px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row.join('-')}`} className="odd:bg-[#001a36] even:bg-[#00152c]">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="border-b border-blue-500/20 px-3 py-2 text-blue-100/90">
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
