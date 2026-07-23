import { Link } from 'react-router-dom'

function TicketListMessageCard({ tickets = [] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-xs text-slate-300">
        No tickets yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="bg-slate-900/80 text-slate-300">
          <tr>
            <th className="border-b border-slate-700 px-3 py-2 font-semibold">Ticket</th>
            <th className="border-b border-slate-700 px-3 py-2 font-semibold">Status</th>
            <th className="border-b border-slate-700 px-3 py-2 font-semibold">Summary</th>
            <th className="border-b border-slate-700 px-3 py-2 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="odd:bg-slate-900/30 even:bg-slate-900/10">
              <td className="border-b border-slate-800 px-3 py-2 text-slate-100">{ticket.id}</td>
              <td className="border-b border-slate-800 px-3 py-2 text-slate-200">{ticket.status}</td>
              <td className="border-b border-slate-800 px-3 py-2 text-slate-200">{ticket.summary}</td>
              <td className="border-b border-slate-800 px-3 py-2">
                <Link
                  to={`/chat/${ticket.channelId}`}
                  className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-200 hover:bg-cyan-500/30"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TicketListMessageCard
