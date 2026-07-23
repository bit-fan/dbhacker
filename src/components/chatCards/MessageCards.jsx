import ChartMessageCard from './ChartMessageCard'
import ImageMessageCard from './ImageMessageCard'
import TableMessageCard from './TableMessageCard'
import TicketListMessageCard from './TicketListMessageCard'
import TextMessageCard from './TextMessageCard'

function MessageCards({ parts = [] }) {
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        const key = `${part.type || 'unknown'}-${index}`

        if (part.type === 'table') {
          return <TableMessageCard key={key} columns={part.columns} rows={part.rows} />
        }

        if (part.type === 'chart') {
          return <ChartMessageCard key={key} title={part.title} series={part.series} />
        }

        if (part.type === 'image') {
          return <ImageMessageCard key={key} src={part.src} alt={part.alt} caption={part.caption} />
        }

        if (part.type === 'ticketList') {
          return <TicketListMessageCard key={key} tickets={part.tickets} />
        }

        return <TextMessageCard key={key} text={part.text || ''} />
      })}
    </div>
  )
}

export default MessageCards
