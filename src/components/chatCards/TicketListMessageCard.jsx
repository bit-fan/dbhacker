import { Link } from 'react-router-dom'

function TicketListMessageCard({ tickets = [] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-md border border-blue-500/35 bg-[#001124] px-3 py-2 text-xs text-blue-100/80">
        No tickets yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-blue-500/35 bg-[#001124]">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="bg-blue-500/20 text-blue-100">
          <tr>
            <th className="border-b border-blue-500/35 px-3 py-2 font-semibold">Ticket</th>
            <th className="border-b border-blue-500/35 px-3 py-2 font-semibold">Status</th>
            <th className="border-b border-blue-500/35 px-3 py-2 font-semibold">Summary</th>
            <th className="border-b border-blue-500/35 px-3 py-2 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="odd:bg-[#001a36] even:bg-[#00152c]">
              <td className="border-b border-blue-500/20 px-3 py-2 text-blue-100">{ticket.id}</td>
              <td className="border-b border-blue-500/20 px-3 py-2 text-blue-100/90">{ticket.status}</td>
              <td className="border-b border-blue-500/20 px-3 py-2 text-blue-100/90">{ticket.summary}</td>
              <td className="border-b border-blue-500/20 px-3 py-2">
                <Link
                  to={`/chat/${ticket.channelId}`}
                  className="rounded-md border border-blue-300/70 bg-blue-500 px-2 py-1 text-white hover:bg-blue-400"
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
